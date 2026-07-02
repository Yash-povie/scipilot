import glob

dockerfiles = glob.glob("services/*/Dockerfile")
for df in dockerfiles:
    with open(df, "r") as f:
        content = f.read()
    
    if "RUN pip install --no-cache /wheels/*" in content:
        content = content.replace(
            "RUN pip install --no-cache /wheels/*", 
            "ENV TMPDIR=/var/tmp\nRUN pip install --no-cache /wheels/*"
        )
        with open(df, "w") as f:
            f.write(content)
        print(f"Patched {df}")
