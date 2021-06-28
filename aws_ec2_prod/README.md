# URL Cafe

## Install

Pip install all necessary modules

Then we can run the application:

```bash
uvicorn app.main:app --reload --env-file .env
```

In production you may want to use gunicorn with uvicorn workers. You can get all the information about deployment from [here](https://www.uvicorn.org/deployment/).
 
