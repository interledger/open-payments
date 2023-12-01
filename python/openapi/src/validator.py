from openapi_core import Config, OpenAPI, V31RequestValidator, V31ResponseValidator
from openapi_core.contrib.requests import RequestsOpenAPIRequest
from openapi_core.contrib.requests import RequestsOpenAPIResponse
from requests import Request, Response

class OpenAPIValidator:
    def __init__(self, path: str):
        config = Config(
            request_validator_cls=V31RequestValidator,
            response_validator_cls=V31ResponseValidator
        )

        self.open_api = OpenAPI.from_file_path(path, config=config)
        
    def validate_request(self, request: Request) -> bool:
        openapi_request = RequestsOpenAPIRequest(request)
        return self.open_api.validate_request(openapi_request)

    def validate_response(self, response: Response) -> bool:
        openapi_response = RequestsOpenAPIResponse(response)
        return self.open_api.validate_response(openapi_response)