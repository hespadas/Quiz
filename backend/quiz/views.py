from django.http import JsonResponse

def api_teste(request):
    data = {
        'mensagem': 'Olá do Django!'
    }
    return JsonResponse(data)