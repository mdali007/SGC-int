from rest_framework import generics, permissions, status
from .serializers import RegisterSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.views import APIView

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

# Custom login that sets refresh token into an HttpOnly cookie
class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # response.data contains 'access' and 'refresh'
        refresh = response.data.get('refresh', None)
        if refresh:
            # set cookie (for dev, secure=False)
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                samesite='Lax',  # or 'Strict' in real deployment
                secure=False,    # True for HTTPS
                max_age=7*24*60*60,
            )
            # optionally remove refresh from response JSON:
            response.data.pop('refresh', None)
        return response

# Endpoint to refresh using refresh cookie
class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        if not refresh:
            return Response({"detail":"Refresh token not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = TokenRefreshSerializer(data={'refresh': refresh})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

# Logout: clear cookie and optionally blacklist
class LogoutView(APIView):
    def post(self, request):
        response = Response({"detail":"Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
