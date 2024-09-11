class ServerConfig:
    def __init__(self):
        self.useLocalServer = False

    def setup(self, args):
        self.useLocalServer = args.localserver


serverConfig = ServerConfig()
