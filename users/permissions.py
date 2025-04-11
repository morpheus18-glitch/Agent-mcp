from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsSelfOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow users to edit their own profile
    or admins to edit any profile.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.role == 'admin':
            return True
            
        # Users can only edit themselves
        return obj.id == request.user.id

class IsStandardOrAdmin(permissions.BasePermission):
    """
    Allows access only to standard or admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['standard', 'admin']
