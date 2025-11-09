from __future__ import annotations

from typing import Any, Dict

from app.services.rmp import RMPClient

_DEFAULT_SCHOOL = "University of Nebraska-Lincoln"

_TOOL_DECLARATIONS = [
    {
        "name": "get_professor_summary",
        "description": (
            "Retrieve a RateMyProfessors summary for an instructor at the "
            "University of Nebraska-Lincoln."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "professor_name": {
                    "type": "string",
                    "description": "Name of the professor to search for.",
                },
            },
            "required": ["professor_name"],
        },
    },
]

_rmp_client = RMPClient()

ToolPayload = Dict[str, Any]
ToolResult = Dict[str, Any]


def _generate_professor_summary_markdown_table(summary: Dict[str, Any]) -> str:
    """Generate a markdown table representation of professor summary data."""
    if not summary:
        return ""
    
    # Escape pipe characters in cell content to avoid breaking table format
    def escape_pipes(s: str) -> str:
        return str(s).replace("|", "\\|")
    
    # Extract data with defaults
    name = escape_pipes(summary.get("name", ""))
    rating = summary.get("rating", "")
    difficulty = summary.get("difficulty", "")
    num_ratings = summary.get("num_ratings", "")
    would_take_again = summary.get("would_take_again", "")
    
    # Format would_take_again as percentage if it's a number
    if isinstance(would_take_again, (int, float)):
        would_take_again = f"{would_take_again}%"
    
    # Create markdown table
    headers = ["Name", "Rating", "Difficulty", "Number of Ratings", "Would Take Again"]
    header_row = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |"
    
    data_row = "| " + " | ".join([
        name,
        str(rating),
        str(difficulty),
        str(num_ratings),
        str(would_take_again),
    ]) + " |"
    
    heading = "**Professor Summary:**"
    table = "\n".join([header_row, separator, data_row])
    
    return f"{heading}\n\n{table}"


def _handle_get_professor_summary(payload: ToolPayload) -> ToolResult:
    professor_name = payload.get("professor_name")
    if not professor_name:
        raise ValueError("Function call missing 'professor_name'.")

    summary = _rmp_client.get_professor_summary(
        school_name=_DEFAULT_SCHOOL,
        professor_name=professor_name,
    )

    # Generate markdown table if summary is available
    markdown_table = None
    if summary and isinstance(summary, dict):
        markdown_table = _generate_professor_summary_markdown_table(summary)

    return summary, markdown_table


TOOL_DECLARATIONS = _TOOL_DECLARATIONS
TOOL_HANDLERS = {
    "get_professor_summary": _handle_get_professor_summary,
}

