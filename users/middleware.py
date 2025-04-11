import json
from .models import AuditLog

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Only log API requests from authenticated users
        if request.path.startswith('/api/') and request.user.is_authenticated:
            # Skip certain endpoints that would create too much noise
            if not any(x in request.path for x in ['/api/v1/analytics/metrics/', '/api/v1/conversations/stream/']):
                self._log_request(request, response)
                
        return response
    
    def _log_request(self, request, response):
        # Extract entity type and ID from the URL if possible
        path_parts = request.path.strip('/').split('/')
        entity_type = path_parts[2] if len(path_parts) > 2 else 'unknown'
        entity_id = path_parts[3] if len(path_parts) > 3 else 'unknown'
        
        # Determine the action based on the HTTP method
        action_map = {
            'GET': 'view',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        action = action_map.get(request.method, request.method.lower())
        
        # Create the audit log
        try:
            details = {}
            if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, 'body'):
                try:
                    # Don't log sensitive data like passwords
                    body_data = json.loads(request.body)
                    if 'password' in body_data:
                        body_data['password'] = '[REDACTED]'
                    details['request_body'] = body_data
                except:
                    pass
            
            AuditLog.objects.create(
                user=request.user,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            # Don't let audit logging failures affect the response
            print(f"Audit log error: {str(e)}")
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
