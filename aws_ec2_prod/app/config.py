from pydantic import BaseSettings, FilePath, SecretStr


class Settings(BaseSettings):
    KEY_PATH: FilePath = "resources/keys.json"
    IP_STACK_ACCESS_KEY: SecretStr
    STRIPE_PRICE_ID: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_KEY: str
    MONGO_URL: str
    OKTA_ISSUER: str
    OKTA_AUDIENCE: str
    OKTA_CLIENT_ID: str


settings = Settings()
