import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from json_normalizer import normalize_value, normalize_dict, normalize_list, values_are_equal


class TestNormalizeValue:
    def test_normalize_none(self):
        assert normalize_value(None) is None

    def test_normalize_string(self):
        assert normalize_value("hello") == "hello"
        assert normalize_value("  hello  ") == "hello"

    def test_normalize_number(self):
        assert normalize_value(42) == 42
        assert normalize_value(3.14) == 3.14

    def test_normalize_dict(self):
        assert normalize_value({"b": 2, "a": 1}) == {"a": 1, "b": 2}

    def test_normalize_list(self):
        assert normalize_value([2, 1, 3]) == [1, 2, 3]

    def test_normalize_json_string(self):
        json_str = '{"b": 2, "a": 1}'
        assert normalize_value(json_str) == {"a": 1, "b": 2}

    def test_normalize_invalid_json_string(self):
        invalid_json = '{"b": 2, "a": 1'
        assert normalize_value(invalid_json) == invalid_json

    def test_normalize_nested_json(self):
        nested = '{"c": {"d": 4, "e": 5}, "a": 1}'
        expected = {"a": 1, "c": {"d": 4, "e": 5}}
        assert normalize_value(nested) == expected


class TestNormalizeDict:
    def test_normalize_dict_sorts_keys(self):
        assert normalize_dict({"b": 2, "a": 1, "c": 3}) == {"a": 1, "b": 2, "c": 3}

    def test_normalize_dict_recursively(self):
        nested = {"b": {"d": 4, "c": 3}, "a": 1}
        expected = {"a": 1, "b": {"c": 3, "d": 4}}
        assert normalize_dict(nested) == expected

    def test_normalize_dict_with_json_values(self):
        assert normalize_dict({"a": '{"b": 2}'}) == {"a": {"b": 2}}


class TestNormalizeList:
    def test_normalize_list_sorts_primitives(self):
        assert normalize_list([3, 1, 2]) == [1, 2, 3]

    def test_normalize_list_sorts_strings(self):
        assert normalize_list(["c", "a", "b"]) == ["a", "b", "c"]

    def test_normalize_list_does_not_sort_complex(self):
        complex_list = [{"a": 1}, {"b": 2}]
        assert normalize_list(complex_list) == [{"a": 1}, {"b": 2}]

    def test_normalize_list_normalizes_elements(self):
        assert normalize_list(['{"b": 2, "a": 1}', '{"d": 4, "c": 3}']) == [
            {"a": 1, "b": 2},
            {"c": 3, "d": 4}
        ]


class TestValuesAreEqual:
    def test_equal_primitives(self):
        assert values_are_equal(1, 1) is True
        assert values_are_equal("hello", "hello") is True
        assert values_are_equal(True, True) is True

    def test_unequal_primitives(self):
        assert values_are_equal(1, 2) is False
        assert values_are_equal("hello", "world") is False

    def test_equal_none(self):
        assert values_are_equal(None, None) is True
        assert values_are_equal(None, "null") is False

    def test_equal_dicts_with_different_key_order(self):
        dict_a = {"tag": "34", "rule.trigger": "denied", "rule.filter": "900"}
        dict_b = {"rule.trigger": "denied", "rule.filter": "900", "tag": "34"}
        assert values_are_equal(dict_a, dict_b) is True

    def test_equal_json_strings_with_different_key_order(self):
        json_a = '{"tag": "34", "rule.trigger": "denied", "rule.filter": "900"}'
        json_b = '{"rule.trigger": "denied", "rule.filter": "900", "tag": "34"}'
        assert values_are_equal(json_a, json_b) is True

    def test_unequal_dicts(self):
        dict_a = {"tag": "34", "rule.trigger": "denied"}
        dict_b = {"tag": "35", "rule.trigger": "denied"}
        assert values_are_equal(dict_a, dict_b) is False

    def test_equal_nested_dicts(self):
        dict_a = {"a": {"b": {"c": 1, "d": 2}}}
        dict_b = {"a": {"b": {"d": 2, "c": 1}}}
        assert values_are_equal(dict_a, dict_b) is True

    def test_equal_lists(self):
        list_a = [3, 1, 2]
        list_b = [1, 2, 3]
        assert values_are_equal(list_a, list_b) is True

    def test_unequal_lists(self):
        list_a = [1, 2, 3]
        list_b = [1, 2, 4]
        assert values_are_equal(list_a, list_b) is False

    def test_spec_example_properties_column(self):
        # This is the exact example from the spec
        properties_a = {
            "tag": "34",
            "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
            "rule.trigger": "denied",
            "rule.filter": "900"
        }
        properties_b = {
            "rule.trigger": "denied",
            "rule.filter": "900",
            "schedule-pattern": "1769631301|every 1 days at 12:00 PM",
            "tag": "34"
        }
        assert values_are_equal(properties_a, properties_b) is True

    def test_string_whitespace_ignored(self):
        assert values_are_equal("  hello  ", "hello") is True
        assert values_are_equal("hello", "  hello  ") is True

    def test_empty_string_vs_none(self):
        assert values_are_equal("", None) is False
        assert values_are_equal(None, "") is False

    def test_mixed_types(self):
        assert values_are_equal("123", 123) is False
        assert values_are_equal("true", True) is False