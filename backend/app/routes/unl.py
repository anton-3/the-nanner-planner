from flask import Blueprint, jsonify
from ..services.unl import get_unl_course_info

unl_routes = Blueprint("unl", __name__)

@unl_routes.route("/course/<dept>/<code>")
def get_course_info(dept, code):
    """
    Get information about a UNL course.
    
    Args:
        dept (str): Department code (e.g., CSCE)
        code (str): Course number (e.g., 481)
    """
    result = get_unl_course_info(dept.upper(), code)
    return jsonify(result)