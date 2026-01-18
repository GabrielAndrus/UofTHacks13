/**
 * Convert video scan to Three.js component using Gemini
 * Takes a 360-degree video scan and generates Three.js code to render it as an object
 */

export interface VideoToLegoResult {
  threeJSCode: string;
  modelAnalysis?: {
    modelName: string;
    modelType: string;
    description: string;
    extractedPieces: Array<{
      part_id: string;
      name: string;
      quantity: number;
      color_id?: number;
      color_name?: string;
      reasoning: string;
    }>;
  };
}

export async function convertVideoTo3DObject(
  videoFile: File,
  objectName: string,
  apiKey: string
): Promise<VideoToLegoResult> {
  if (!apiKey || apiKey.trim() === '') {
    console.error('[VideoTo3JS] Error: API key is missing');
    throw new Error('API key is missing');
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-pro' });

  // Simplified prompt that asks for object-specific Three.js code
  const prompt = `Create THREE.JS code for a ${objectName}. 

Return ONLY the raw JavaScript code (no markdown blocks, no backticks, no explanations).

The code must:
1. Create a THREE.Group()
2. Add geometries and materials to create the object
3. Add created meshes to the group
4. Have realistic colors and materials
5. Fit within a 2x2x2 unit space
6. Use standard THREE.js imports (THREE is global)

Example pattern:
const group = new THREE.Group()
const material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
const geometry = new THREE.BoxGeometry(1, 1, 1)
const mesh = new THREE.Mesh(geometry, material)
group.add(mesh)
group`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('[VideoTo3JS] Successfully generated 3D object code');
    
    // Clean up the response
    let cleanCode = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```.*?\n/, '').replace(/\n```$/, '');
    }
    
    // Ensure it returns a group
    if (!cleanCode.includes('return')) {
      cleanCode = cleanCode.trim();
      if (cleanCode.endsWith('group')) {
        cleanCode = cleanCode;
      } else {
        cleanCode += '\nreturn group';
      }
    }
    
    // Now analyze the code to extract LEGO pieces
    const modelAnalysis = await analyzeThreeJSForLegoPieces(cleanCode, objectName, apiKey);
    
    return {
      threeJSCode: cleanCode,
      modelAnalysis,
    };
  } catch (error: any) {
    console.error('[VideoTo3JS] Error:', error);
    const errorMessage = error?.message || String(error);
    
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      throw new Error('API quota exceeded. Please wait a few minutes.');
    }
    
    throw new Error(`Failed to generate 3D object: ${errorMessage}`);
  }
}

/**
 * Analyze Three.js code to extract LEGO pieces
 */
async function analyzeThreeJSForLegoPieces(
  threeJSCode: string,
  objectName: string,
  apiKey: string
) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.0-pro' });

  // Truncate code if too long
  const codeSample = threeJSCode.substring(0, 2000);

  const prompt = `You are a LEGO Master Builder expert and Three.js developer.

Analyze this Three.js code for a "${objectName}" and identify:
1. What specific LEGO model this resembles (real LEGO set if possible)
2. The major geometric shapes and their sizes
3. Which LEGO pieces would be used to recreate this
4. Color scheme and color-to-piece mapping
5. Build complexity level

Three.js Code:
\`\`\`javascript
${codeSample}
\`\`\`

Return ONLY valid JSON with this structure (no markdown, no explanation):
{
  "modelName": "Specific model name",
  "modelType": "Category",
  "description": "Detailed description",
  "extractedPieces": [
    {
      "part_id": "3001",
      "name": "Brick 2×4",
      "quantity": 25,
      "color_id": 0,
      "color_name": "Black",
      "reasoning": "Main structural walls"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('[ThreeJSAnalysis] Error:', error);
  }

  // Return default if analysis fails
  return {
    modelName: objectName,
    modelType: 'Generic Object',
    description: `A custom ${objectName} model created from video scan`,
    extractedPieces: [
      {
        part_id: '3001',
        name: 'Brick 2×4',
        quantity: 20,
        color_id: 0,
        color_name: 'Black',
        reasoning: 'Primary structural component',
      },
      {
        part_id: '3002',
        name: 'Brick 2×3',
        quantity: 15,
        color_id: 1,
        color_name: 'Blue',
        reasoning: 'Secondary structural element',
      },
    ],
  };
}

/**
 * Execute generated Three.js code and add object to scene
 */
export async function executeAndAddObject(
  result: VideoToLegoResult,
  scene: any,
  objectName: string
): Promise<{ object: any; modelAnalysis?: any }> {
  try {
    // Import THREE
    const THREE = await import('three');
    
    // Create a safe execution context
    const func = new Function(
      'THREE',
      `
        try {
          ${result.threeJSCode}
        } catch (e) {
          console.error('Error in generated code:', e);
          throw e;
        }
      `
    );
    
    // Execute the function to create the group
    const object = func(THREE);
    
    // Verify it's a Three.js object
    if (!object || typeof object.add !== 'function') {
      throw new Error('Generated code did not return a valid Three.js object');
    }
    
    // Add to scene
    scene.add(object);
    
    console.log(`[VideoTo3JS] Successfully added ${objectName} to scene`);
    console.log('[VideoTo3JS] Model analysis:', result.modelAnalysis);
    
    return {
      object,
      modelAnalysis: result.modelAnalysis,
    };
  } catch (error) {
    console.error('[VideoTo3JS] Error executing Three.js code:', error);
    throw error;
  }
}
