"""Citation validator tests (§5 stage 8 / §7.3 zero-tolerance suite, starter set).

All quotes/claims herein are FIXTURE data with fictional content.
"""

from evals.citation_validator import validate_answer

UUID_A = "11111111-1111-4111-8111-111111111111"
UUID_B = "22222222-2222-4222-8222-222222222222"
UUID_UNKNOWN = "99999999-9999-4999-8999-999999999999"

RETRIEVED = {UUID_A, UUID_B}
EXPERTS = {
    "Stephen Seiler": ["Prof Seiler", "Dr. Seiler"],
    "Joe Friel": [],
    "Anthony Walsh": ["the host"],
}


def test_clean_answer_passes():
    answer = (
        f"Seiler has suggested keeping most riding genuinely easy. [C:{UUID_A}] "
        f"Friel takes a similar line for masters athletes. [C:{UUID_B}] "
        "SOURCES: Ep 100 @ 0:14:05, Ep 200 @ 1:02:11"
    )
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert result.valid
    assert result.cited_claim_ids == {UUID_A, UUID_B}


def test_unknown_citation_rejected():
    answer = f"Seiler said this exact thing. [C:{UUID_UNKNOWN}]"
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert not result.valid
    assert result.unknown_citations == [UUID_UNKNOWN]


def test_expert_named_without_citation_rejected():
    answer = (
        f"Easy volume matters for everyone. [C:{UUID_A}] "
        "Friel has always said sweet spot is overrated."
    )
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert not result.valid
    assert any("Friel" in s for s in result.uncited_expert_sentences)


def test_surname_alone_counts_as_naming():
    answer = "Seiler would tell you to slow down."
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert not result.valid


def test_alias_counts_as_naming():
    answer = "Prof Seiler covered this years ago."
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert not result.valid


def test_sources_line_is_exempt():
    answer = f"Keep it easy most days. [C:{UUID_A}] SOURCES: Ep 100 @ 0:14:05 (Stephen Seiler)"
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert result.valid


def test_uncited_framing_without_facts_passes():
    answer = f"Good question — this comes up a lot. The short answer is more easy volume. [C:{UUID_A}]"
    result = validate_answer(answer, RETRIEVED, EXPERTS)
    assert result.valid
