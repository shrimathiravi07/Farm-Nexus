from fastapi import HTTPException, status


def require_role(*allowed_roles):

    def role_checker(user_role: str):

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return True

    return role_checker