"""
Pydantic schemas for TwelveLabs analysis and Master Builder data contracts.
For Backboard integration contracts, see data_contracts.py
"""
from pydantic import BaseModel
from typing import List, Optional


class Dimensions(BaseModel):
    """Dimensions in millimeters"""
    height: float
    width: float
    depth: float


class Complexity(BaseModel):
    """Complexity flags for object analysis"""
    is_airy: bool
    has_curves: bool
    has_floating_parts: bool


class ThreeJSMesh(BaseModel):
    """Three.js-compatible mesh representation"""
    vertices: List[List[float]]  # List of [x, y, z] coordinates
    faces: List[List[int]]  # List of face indices [i, j, k] (triangles)
    normals: Optional[List[List[float]]] = None  # Optional vertex normals
    colors: Optional[List[str]] = None  # Optional vertex colors (hex)


class ObjectAnalysisResponse(BaseModel):
    """Structured analysis response from TwelveLabs Pegasus engine"""
    dimensions_mm: Dimensions
    dominant_colors: List[str]  # Hex color strings
    complexity: Complexity
    threejs_mesh: Optional[ThreeJSMesh] = None  # Three.js mesh representation