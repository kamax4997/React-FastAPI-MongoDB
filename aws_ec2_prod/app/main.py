import click

from os import name
from re import template
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from starlette.requests import Request
from app.api import router
from app.redirectioner import router as redirectioner
from app.stripe_subscription import stripe_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="URL Cafe")


@app.middleware('http')
async def check_urls(request: Request, call_next):
    response = await call_next(request)

    # the server respond the request with "Not Found" so the middleware must redirect to homw
    if response.headers.get('content-length') == '9' and \
            response.headers.get('content-type') == 'text/plain; charset=utf-8':
        return RedirectResponse('/')

    if response.status_code == 404:
        return RedirectResponse('/')

    return response


app.include_router(stripe_router)
app.include_router(router)
app.include_router(redirectioner)

app.mount("/cdn/intermediate-pages", StaticFiles(directory="app/intermediate_pages", html=True), name="")
app.mount("/dashboard", StaticFiles(directory="app/react", html=True), name="")
app.mount("/login", StaticFiles(directory="app/react", html=True), name="")
app.mount("/login-callback", StaticFiles(directory="app/react", html=True), name="")
app.mount("/", StaticFiles(directory="app/react", html=True), name="")


templates = Jinja2Templates(directory="app/react")


@app.get(path="/", name="API Foo")
async def serve_spa(request: Request):
    return StaticFiles(directory="static")

origins = ["*"]

app.add_middleware(
     CORSMiddleware,
     allow_origins=origins,
     allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
)
