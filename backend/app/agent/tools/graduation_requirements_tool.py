from __future__ import annotations

from typing import Any, Dict

ToolPayload = Dict[str, Any]
ToolResult = Dict[str, Any]

_TOOL_DECLARATIONS = [
    {
        "name": "get_remaining_graduation_requirements",
        "description": (
            "Get the list of remaining graduation requirements for the student. "
            "Each requirement is represented as an object with two fields: "
            "'courses' (a list of course identifiers) and 'required_count' (the number of courses "
            "from that list that must be taken). For example, if a requirement has "
            "courses: ['CSCE 377', 'CSCE 423', 'CSCE 424', 'CSCE 428', 'CSCE 463'] and "
            "required_count: 1, this means the student must take exactly one of those five courses. "
            "If a requirement has courses: ['CSCE 402H'] and required_count: 1, this means "
            "CSCE 402H is a mandatory individual course requirement. "
            "The response is a JSON object with a 'requirements' field containing a list of these "
            "requirement objects. Use this tool to help students understand what courses they still "
            "need to complete for graduation."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    }
]


def _handle_get_remaining_graduation_requirements(payload: ToolPayload) -> tuple[ToolResult, None]:
    """
    Handle the get_remaining_graduation_requirements tool call.
    
    Returns a hardcoded list of graduation requirements:
    - CSCE 402H is required (mandatory course)
    - One of CSCE 377, 423, 424, 428, 463 must be taken (choice requirement)
    """
    requirements = [
        {
            "courses": ["CSCE 402H"],
            "required_count": 1,
        },
        {
            "courses": ["CSCE 377", "CSCE 423", "CSCE 424", "CSCE 428", "CSCE 463"],
            "required_count": 1,
        },
    ]

    result: ToolResult = {
        "requirements": requirements,
        "message": "Graduation requirements retrieved successfully.",
    }

    return result, None


TOOL_DECLARATIONS = _TOOL_DECLARATIONS
TOOL_HANDLERS = {
    "get_remaining_graduation_requirements": _handle_get_remaining_graduation_requirements,
}

