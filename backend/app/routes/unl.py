from flask import Blueprint, jsonify
from ..services.unl import get_unl_course_info

unl_routes = Blueprint("unl", __name__)

@unl_routes.route("/course/<course_id>")
def get_course_info(course_id):
    """
    Get information about a UNL course.
    
    Args:
        course_id (str): Course identifier (e.g., CSCE 123)
    """
    result = get_unl_course_info(course_id)
    return jsonify(result)