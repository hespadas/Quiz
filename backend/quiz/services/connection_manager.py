

class ConnectionManager:
    def __init__(self, room_code, cache_manager):
        self.room_code = room_code
        self.cache_manager = cache_manager

    def add_connection(self, username):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] += 1
        else:
            room_connections[username] = 1
            user_count = self.cache_manager.get_user_count() + 1
            self.cache_manager.set_user_count(user_count)
        self.cache_manager.set_room_user_connections(room_connections)

    def remove_connection(self, username):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] -= 1
            if room_connections[username] <= 0:
                del room_connections[username]
                new_count = max(self.cache_manager.get_user_count() - 1, 0)
                self.cache_manager.set_user_count(new_count)
        self.cache_manager.set_room_user_connections(room_connections)
        expected_submissions = self.cache_manager.get_expected_submissions()
        if expected_submissions > 0:
            self.cache_manager.set_expected_submissions(expected_submissions - 1)
