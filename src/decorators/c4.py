import importlib.util
import os
import sys
import inspect
from typing import List, Dict, Optional, Set


def c4_external_system(name: str, description: str):
    """
    A decorator to mark a class as an external system for C4 architecture modeling.

    This decorator adds metadata to a class, identifying it as an external system
    in the context of a C4 model. The metadata includes a `name` and a `description`,
    which can be used to document or identify the external system.

    Attributes:
        _c4_external_system_name (str): The name of the external system.
        _c4_external_system_description (str): A brief description of the external system.

    Args:
        name (str): The name to assign to the external system.
        description (str): A brief description of what the external system does.

    Returns:
        type: The decorated class with additional C4 external system metadata.

    Example:
        @c4_external_system("PaymentGateway", "Handles payment processing for transactions.")
        class PaymentGateway:
            pass

        # The PaymentGateway class will now have the following attributes:
        # _c4_external_system_name = "PaymentGateway"
        # _c4_external_system_description = "Handles payment processing for transactions."
    """

    def decorator(cls):
        cls._c4_external_system_name = name
        cls._c4_external_system_description = description
        return cls

    return decorator


def __load_module_from_file(file_path: str):
    """
    Load a Python module from the given file path.

    :param file_path: Path to the Python file.
    :return: The loaded module.
    """
    file_name = os.path.basename(file_path)
    module_name = os.path.splitext(file_name)[0]

    if module_name in sys.modules:
        return sys.modules[module_name]

    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)

    return module


def list_c4_external_systems_from_file(
        file_path: str,
        processed_class_names: Optional[Set[str]] = None
) -> List[Dict[str, str]]:
    """
    List all C4 external systems from a given file.

    :param file_path: Path to the Python file.
    :param processed_class_names: A set to track already processed class names (optional).
    :return: A list of dictionaries with 'name' and 'description' of each external system.
    """
    if processed_class_names is None:
        processed_class_names = set()

    module = __load_module_from_file(file_path)
    result = []

    for _, value in inspect.getmembers(module):
        if inspect.isclass(value) and hasattr(value, '_c4_external_system_description'):
            class_name = value.__name__
            if class_name not in processed_class_names:
                name = getattr(value, '_c4_external_system_name', None)
                description = getattr(value, '_c4_external_system_description', None)
                result.append({
                    'class_name': class_name,
                    'name': name,
                    'description': description
                })
                processed_class_names.add(class_name)

    return result


def list_c4_external_systems_from_dir(dir_path: str) -> List[Dict[str, str]]:
    """
    List all C4 external systems from Python files in a directory.

    :param dir_path: Path to the directory containing Python files.
    :return: A list of dictionaries with 'name' and 'description' of each external system.
    """
    result = []
    processed_class_names = set()

    for file in os.listdir(dir_path):
        file_path = os.path.join(dir_path, file)
        # Skip non-Python files
        if not file.endswith('.py'):
            continue

        try:
            systems = list_c4_external_systems_from_file(file_path, processed_class_names)
            result.extend(systems)
        except (ImportError, SyntaxError, FileNotFoundError) as ex:
            print(f"Skipping file {file} due to an error: {ex}")

    return result
