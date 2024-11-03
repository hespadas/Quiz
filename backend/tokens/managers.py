class CookieManager:
    @staticmethod
    def set_access_token_cookie(response, token):
        response.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=True,
            samesite="Lax",
            max_age=300,
        )

    @staticmethod
    def set_refresh_token_cookie(response, token):
        response.set_cookie(
            "refresh_token",
            token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=604800,
        )

    @staticmethod
    def delete_token_cookies(response):
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
