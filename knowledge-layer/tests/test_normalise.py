"""Stage 5 entity-resolution tests (FIXTURE experts; real public names of the
show's known experts are used only as alias-matching examples)."""

from pipeline.stages.normalise import new_expert_row, normalise_name, resolve_expert

EXPERTS = [
    {"id": "1", "canonical_name": "Stephen Seiler",
     "aliases": ["Prof Seiler", "Dr. Seiler", "Stephen"]},
    {"id": "2", "canonical_name": "Joe Friel", "aliases": []},
    {"id": "3", "canonical_name": "Tadej Pogačar", "aliases": []},
    {"id": "4", "canonical_name": "FIXTURE Stephen Othersurname", "aliases": []},
]


def test_normalise_strips_honorifics_punctuation_diacritics():
    assert normalise_name("Dr. Stephen Seiler") == "stephen seiler"
    assert normalise_name("Prof. Seiler") == "seiler"
    assert normalise_name("Pogačar") == "pogacar"
    assert normalise_name("  Coach JOE FRIEL ") == "joe friel"


def test_exact_and_alias_resolution():
    assert resolve_expert("Stephen Seiler", EXPERTS)["id"] == "1"
    assert resolve_expert("dr seiler", EXPERTS)["id"] == "1"
    assert resolve_expert("Prof Seiler", EXPERTS)["id"] == "1"
    assert resolve_expert("Joe Friel", EXPERTS)["id"] == "2"


def test_unique_surname_resolution():
    assert resolve_expert("Friel", EXPERTS)["id"] == "2"
    assert resolve_expert("Pogacar", EXPERTS)["id"] == "3"  # diacritic-insensitive


def test_ambiguity_resolves_to_nobody():
    # "Stephen" is an alias of expert 1 AND the first name of expert 4's
    # canonical name — but alias match is exact and unique, so it resolves...
    assert resolve_expert("Stephen", EXPERTS)["id"] == "1"
    # ...whereas a surname shared by nobody, or a name matching multiple
    # experts exactly, must return None.
    both = EXPERTS + [{"id": "5", "canonical_name": "Another Seiler", "aliases": []}]
    assert resolve_expert("Seiler", both) is None
    assert resolve_expert("Unknown Person", EXPERTS) is None
    assert resolve_expert("", EXPERTS) is None


def test_new_expert_row_never_carries_credentials():
    row = new_expert_row("  FIXTURE New Guest ")
    assert row["canonical_name"] == "FIXTURE New Guest"
    assert "credentials" not in row  # §8.1: human-curated only, never pipeline-set
    assert "unreviewed-new-guest" in row["domain_tags"]
