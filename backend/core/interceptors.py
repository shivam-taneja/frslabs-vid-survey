import json
from fastapi import Response
from fastapi.routing import APIRoute
from starlette.responses import StreamingResponse, FileResponse
from typing import Callable


class ApiResponseRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_handler = super().get_route_handler()

        async def custom_handler(request):
            # Execute the actual route logic
            response = await original_handler(request)

            if isinstance(response, (StreamingResponse, FileResponse)):
                return response

            # Wrap standard JSON responses
            if (
                isinstance(response, Response)
                and response.media_type == "application/json"
            ):
                try:
                    body = json.loads(response.body)

                    # If it's already wrapped (e.g., from an error handler), skip
                    if isinstance(body, dict) and "success" in body:
                        return response

                    wrapped_response = {
                        "code": response.status_code,
                        "message": "Success",
                        "success": True,
                        "data": body,
                        "error": None,
                    }
                    return Response(
                        content=json.dumps(wrapped_response),
                        status_code=response.status_code,
                        media_type="application/json",
                    )
                except json.JSONDecodeError:
                    pass

            return response

        return custom_handler
