from setuptools import setup, find_namespace_packages

setup(
    name="omni-api",
    version="0.1",
    packages=find_namespace_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "omni-utils",
        "omni-models"
    ],
)