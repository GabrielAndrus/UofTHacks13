import os
import json
import logging
from backboard import BackboardClient
from dotenv import load_dotenv
from app.services.master_builder import MasterBuilder, VoxelCluster

load_dotenv()

logger = logging.getLogger(__name__)

class BackboardService:
    def __init__(self):
        # Initializing the 'Single API' for 2200+ models
        self.client = BackboardClient(api_key=os.getenv("BACKBOARD_API_KEY"))
        self.assistant_id = None
        
        # Initialize the Master Builder (Source of Truth for 3D grid)
        self.master_builder = MasterBuilder()
        
        # Define the tools the AI can use to interact with your LEGO logic
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "place_brick",
                    "description": "Registers a LEGO brick into the 3D grid and master inventory.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "part_id": {"type": "string", "description": "Official LEGO part ID"},
                            "color_id": {"type": "integer", "description": "Rebrickable color ID"},
                            "position": {"type": "array", "items": {"type": "integer"}, "description": "[x, y, z]"},
                            "is_ai_filled": {"type": "boolean", "description": "Set to true if this brick fills a visual gap"}
                        },
                        "required": ["part_id", "color_id", "position"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "finalize_assembly_step",
                    "description": "Groups placed bricks into a logical instruction step.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "step_number": {"type": "integer"},
                            "description": {"type": "string"}
                        }
                    }
                }
            }
        ]

    async def get_or_create_lego_assistant(self):
        """Sets up the Master Builder with 'Auto' memory and pre-defined tools."""
        if self.assistant_id:
            return self.assistant_id

        assistant = await self.client.create_assistant(
            name="LEGO Master Builder",
            description="Expert in structural engineering and 3D LEGO synthesis. Uses Twelve Labs data to build worlds.",
            memory="Auto", 
            metadata={"project": "lego-playground"}
        )
        self.assistant_id = assistant.assistant_id
        return self.assistant_id

    async def start_session(self, scenery_data: dict):
        """
        Starts a stateful thread and anchors it with Scenery JSON.
        This initializes the Master Builder with the scenery as ground truth.
        """
        assistant_id = await self.get_or_create_lego_assistant()
        thread = await self.client.create_thread(assistant_id=assistant_id)

        # Initialize Master Builder with scenery anchor
        self.master_builder.initialize_scenery(scenery_data)

        # Inject Scenery as the persistent 'Ground Truth' in thread memory
        await self.client.add_message(
            thread_id=thread.thread_id,
            role="system",
            content=f"SCENERY ANCHOR LOADED: {json.dumps(scenery_data)}. Every object added hereafter must align with this coordinate system. If objects overlap or have missing data, use your 'place_brick' tool to fill gaps logically."
        )
        return thread.thread_id

    async def add_object_to_world(self, thread_id: str, object_data: dict, use_high_thinking: bool = True):
        """
        Processes an individual object and handles gap-filling via Tool Calls.
        
        Args:
            thread_id: Thread ID for the session
            object_data: Object data from TwelveLabs analysis
            use_high_thinking: If True, use Gemini 3 Pro (Architectural Phase),
                              If False, use Gemini 3 Flash (Bulk Phase)
        """
        # Phase 1: Architectural Phase (High Thinking) - Gap filling and structural design
        if use_high_thinking:
            prompt = (
                f"ARCHITECTURAL PHASE: Integrate this object into the playground: {json.dumps(object_data)}. "
                "Analyze the memory of the scenery and the new object to decide where to fill gaps or place support beams. "
                "1. Check for stability against the scenery. "
                "2. Identify missing surfaces or structural gaps. "
                "3. Generate 'ai_filled' bricks to complete the shape or add supports. "
                "4. Use the 'place_brick' tool strategically for structural integrity."
            )

            # Use Gemini 3 Pro for high-reasoning gap filling
            response = await self.client.add_message(
                thread_id=thread_id,
                content=prompt,
                model_name="gemini-3-pro",  # High Thinking for architectural decisions
                tools=self.tools,
                stream=False
            )

            # Handle the Tool Execution Loop
            if response.status == "REQUIRES_ACTION":
                await self._handle_tool_calls(thread_id, response.tool_calls)
        
        # Phase 2: Bulk Phase (Low Thinking) - Fill solid areas rapidly
        bulk_prompt = (
            f"BULK PHASE: Fill the remaining solid areas of this object: {json.dumps(object_data)}. "
            "Use greedy volume fitting: place the largest possible bricks first (2x4, then 2x3, etc.) "
            "to minimize part count. Use the 'place_brick' tool for all remaining placements."
        )
        
        bulk_response = await self.client.add_message(
            thread_id=thread_id,
            content=bulk_prompt,
            model_name="gemini-3-flash",  # Low Thinking for rapid bulk filling
            tools=self.tools,
            stream=False
        )
        
        if bulk_response.status == "REQUIRES_ACTION":
            await self._handle_tool_calls(thread_id, bulk_response.tool_calls)
        
        # Phase 3: Apply engineering rules after placement
        self._apply_engineering_rules(object_data)
        
        # Get final state
        grid_state = self.master_builder.get_grid_state()
        return {
            "status": "completed",
            "grid_state": grid_state,
            "content": bulk_response.content if hasattr(bulk_response, 'content') else "Object integrated"
        }

    async def _handle_tool_calls(self, thread_id, tool_calls):
        """
        Executes the Python logic for the AI's requested brick placements.
        This is where the Master Builder's register_brick is called.
        """
        results = []
        for call in tool_calls:
            if call.function.name == "place_brick":
                args = json.loads(call.function.arguments)
                
                # Call Master Builder to register the brick
                success = self.master_builder.register_brick(
                    part_id=args.get("part_id"),
                    color_id=args.get("color_id"),
                    position=tuple(args.get("position", [0, 0, 0])),
                    dimensions=tuple(args.get("dimensions", [1, 1, 1])) if "dimensions" in args else None,
                    is_ai_filled=args.get("is_ai_filled", False)
                )
                
                logger.info(f"🧱 AI placing brick: {args['part_id']} at {args['position']} - Success: {success}")
                
                results.append({
                    "tool_call_id": call.id,
                    "output": json.dumps({"status": "success" if success else "failed", "placed": success})
                })
            elif call.function.name == "finalize_assembly_step":
                args = json.loads(call.function.arguments)
                logger.info(f"📋 Finalizing assembly step {args.get('step_number')}: {args.get('description')}")
                results.append({
                    "tool_call_id": call.id,
                    "output": json.dumps({"status": "step_finalized"})
                })

        # Submit results back to Backboard to finalize the turn
        final_turn = await self.client.submit_tool_outputs(
            thread_id=thread_id,
            tool_outputs=results
        )
        return final_turn.content if hasattr(final_turn, 'content') else None
    
    def _apply_engineering_rules(self, object_data: dict):
        """
        Apply the three core engineering rules after object placement:
        1. Laminar Interlocking check
        2. Connectivity Audit (for floating parts)
        Note: Greedy Volume Fitting is applied during placement
        """
        # Rule 2: Check laminar interlocking for all layers
        max_layer = max(self.master_builder.layer_bricks.keys()) if self.master_builder.layer_bricks else 0
        for layer in range(max_layer + 1):
            interlock_bricks = self.master_builder.check_laminar_interlocking(layer)
            if interlock_bricks:
                logger.info(f"🔗 Applied laminar interlocking: added {len(interlock_bricks)} bricks to layer {layer + 1}")
        
        # Rule 3: Connectivity Audit - check for floating parts
        disconnected_clusters = self.master_builder.connectivity_audit()
        if disconnected_clusters:
            logger.warning(f"⚠️  Found {len(disconnected_clusters)} disconnected clusters")
            # In a real implementation, this would trigger Gemini 3 Pro to "hallucinate" structural supports
            # For now, we log the clusters that need attention
            for i, cluster in enumerate(disconnected_clusters):
                logger.warning(f"  Cluster {i+1}: {len(cluster.voxels)} floating voxels at bbox {cluster.bounding_box}")
    
    def get_master_builder_state(self) -> dict:
        """Get the current state of the Master Builder"""
        return self.master_builder.get_grid_state()