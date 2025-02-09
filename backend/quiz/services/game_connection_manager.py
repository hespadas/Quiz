import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self, room_code, cache_manager):
        self.room_code = room_code
        self.cache_manager = cache_manager

    async def add_connection(self, username, channel_layer, room_group_name, channel_name):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] += 1
        else:
            room_connections[username] = 1
            user_count = self.cache_manager.get_user_count() + 1
            self.cache_manager.set_user_count(user_count)

        self.cache_manager.set_room_user_connections(room_connections)
        await channel_layer.group_add(room_group_name, channel_name)
        logger.info(f"Usuário {username} conectado à sala {self.room_code}. Grupo atualizado.")

    async def remove_connection(self, username, channel_layer, room_group_name, channel_name):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] -= 1
            if room_connections[username] <= 0:
                del room_connections[username]
                new_count = max(self.cache_manager.get_user_count() - 1, 0)
                self.cache_manager.set_user_count(new_count)

        self.cache_manager.set_room_user_connections(room_connections)
        await channel_layer.group_discard(room_group_name, channel_name)
        logger.info(f"Usuário {username} desconectado da sala {self.room_code}.")
