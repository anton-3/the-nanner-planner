import logging
import os
from typing import Any, Dict
from urllib.parse import quote

import requests

logger = logging.getLogger(__name__)


class CollegeSchedulerClient:
    """Client for interacting with the UNL College Scheduler service."""

    def __init__(self, base_url: str = "https://unl.collegescheduler.com", api_key: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or os.getenv("COLLEGESCHEDULER_API_KEY")

        if not self.api_key:
            raise RuntimeError("COLLEGESCHEDULER_API_KEY is not set in the environment.")

        self._session = requests.Session()
        self._session.headers.update({"Accept": "application/json"})
        self._session.cookies.set(".AspNet.Cookies", self.api_key, domain="unl.collegescheduler.com")

    def get_registration_blocks(self, course_id: str, term: str = "Spring 2026") -> Dict[str, Any]:
        """Return the registration blocks for a specific course in a given term."""
        if not course_id or not course_id.strip():
            raise ValueError("course_id must be provided (e.g., 'CSCE 155A').")

        subject, course_code = self._parse_course_id(course_id)

        term_segment = quote(term.strip(), safe="")
        subject_segment = quote(subject, safe="")
        course_segment = quote(course_code, safe="")

        url = (
            f"{self.base_url}/api/terms/{term_segment}"
            f"/subjects/{subject_segment}"
            f"/courses/{course_segment}"
            "/regblocks"
        )

        try:
            response = self._session.get(url, timeout=15)
            response.raise_for_status()
            data: Dict[str, Any] = response.json()

            sections = data.get("sections")
            if isinstance(sections, list):
                allowed_keys = {
                    "id",
                    "sectionNumber",
                    "openSeats",
                    "location",
                    "days",
                    "startTime",
                    "endTime",
                    "name",
                    "credits",
                    "component",
                    "waitlistOpen",
                    "instructor",
                }
                filtered_sections: list[Dict[str, Any]] = []
                for section in sections:
                    if isinstance(section, dict):
                        filtered_sections.append({k: section[k] for k in allowed_keys if k in section})
                data["sections"] = filtered_sections

            return data
        except requests.RequestException as exc:
            logger.error("Failed to fetch registration blocks for %s: %s", course_id, exc)
            raise RuntimeError(f"Request to College Scheduler failed for course '{course_id}'.") from exc

    @staticmethod
    def _parse_course_id(course_id: str) -> tuple[str, str]:
        """Split and normalize a course ID like 'CSCE 155A' -> ('CSCE', '155A')."""
        parts = course_id.strip().upper().split()

        if len(parts) < 2:
            raise ValueError("course_id must include both subject and course number (e.g., 'COMM 101').")

        subject = parts[0]
        course_code = "".join(parts[1:])

        if not subject or not course_code:
            raise ValueError("Invalid course_id format; found empty subject or course code.")

        return subject, course_code


def get_registration_blocks(course_id: str, term: str = "Spring 2026") -> Dict[str, Any]:
    """Convenience wrapper around `CollegeSchedulerClient.get_registration_blocks`."""
    client = CollegeSchedulerClient()
    return client.get_registration_blocks(course_id, term=term)