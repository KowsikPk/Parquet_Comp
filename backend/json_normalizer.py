import json
from typing import Any, Dict, List, Union


def ensure_scalar(value: Any) -> Any:
    """
    Convert pandas Series/DataFrame to scalar if needed.
    This handles the case when df.loc[idx] returns multiple rows.
    """
    # Check for pandas types without importing pandas
    if hasattr(value, 'iloc'):  # pandas Series or DataFrame
        try:
            # If it's a single value, extract it
            if hasattr(value, 'item') and value.size == 1:
                return value.item()
            # If it's a Series/DataFrame with multiple values, take first
            elif hasattr(value, 'iloc') and len(value) > 0:
                result = value.iloc[0]
                # Recursively ensure scalar if result is also a pandas type
                if hasattr(result, 'iloc'):
                    return ensure_scalar(result)
                return result
            else:
                return None
        except (ValueError, TypeError):
            # Fallback: convert to string
            return str(value)
    return value


def normalize_value(value: Any) -> Any:
    """Normalize a value for comparison. Handles JSON strings, dicts, and scalars."""
    # First ensure we have a scalar value (not pandas Series/DataFrame)
    value = ensure_scalar(value)
    
    if value is None:
        return None
    if isinstance(value, dict):
        return normalize_dict(value)
    if isinstance(value, list):
        return normalize_list(value)
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("{") or stripped.startswith("["):
            try:
                parsed = json.loads(stripped)
                return normalize_value(parsed)
            except (json.JSONDecodeError, ValueError):
                pass
        return stripped
    return value


def normalize_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively sort dict keys and normalize values."""
    return {k: normalize_value(v) for k, v in sorted(d.items())}


def normalize_list(lst: List[Any]) -> List[Any]:
    """Normalize list elements."""
    normalized = [normalize_value(item) for item in lst]
    # Only sort if all elements are primitives (sortable)
    try:
        return sorted(normalized, key=lambda x: json.dumps(x, sort_keys=True))
    except TypeError:
        return normalized


def values_are_equal(val_a: Any, val_b: Any) -> bool:
    """Compare two values using normalized comparison."""
    norm_a = normalize_value(val_a)
    norm_b = normalize_value(val_b)
    return norm_a == norm_b


def compare_json_objects(obj_a: Any, obj_b: Any, _is_normalized: bool = False) -> bool:
    """
    Compare two JSON objects strictly:
    - Key order doesn't matter
    - Extra fields in either object cause mismatch
    - All fields must be compared
    - Nested structures are handled recursively
    """
    if not _is_normalized:
        norm_a = normalize_value(obj_a)
        norm_b = normalize_value(obj_b)
    else:
        norm_a = obj_a
        norm_b = obj_b
    
    # If both are dicts, compare all keys strictly
    if isinstance(norm_a, dict) and isinstance(norm_b, dict):
        # Check if both have the same keys
        if set(norm_a.keys()) != set(norm_b.keys()):
            return False
        
        # Compare all keys
        for key in norm_a.keys():
            if not compare_json_objects(norm_a[key], norm_b[key], _is_normalized=True):
                return False
        return True
    
    # If both are lists, compare elements
    if isinstance(norm_a, list) and isinstance(norm_b, list):
        if len(norm_a) != len(norm_b):
            return False
        for a_item, b_item in zip(norm_a, norm_b):
            if not compare_json_objects(a_item, b_item, _is_normalized=True):
                return False
        return True
    
    # For other types, use direct comparison
    return norm_a == norm_b


def get_json_differences(obj_a: Any, obj_b: Any, _is_normalized: bool = False) -> List[str]:
    """
    Get detailed differences between two JSON objects.
    Returns a list of difference descriptions.
    """
    if not _is_normalized:
        norm_a = normalize_value(obj_a)
        norm_b = normalize_value(obj_b)
    else:
        norm_a = obj_a
        norm_b = obj_b
    differences = []
    
    if isinstance(norm_a, dict) and isinstance(norm_b, dict):
        all_keys = set(norm_a.keys()) | set(norm_b.keys())
        
        for key in sorted(all_keys):
            if key not in norm_a:
                differences.append(f"Field '{key}' only in File B: {norm_b[key]}")
            elif key not in norm_b:
                differences.append(f"Field '{key}' only in File A: {norm_a[key]}")
            elif not compare_json_objects(norm_a[key], norm_b[key], _is_normalized=True):
                differences.append(f"Field '{key}' differs: A={norm_a[key]}, B={norm_b[key]}")
    
    elif norm_a != norm_b:
        differences.append(f"Values differ: A={norm_a}, B={norm_b}")
    
    return differences
