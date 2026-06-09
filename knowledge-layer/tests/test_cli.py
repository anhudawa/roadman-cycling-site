"""CLI tests (task P0-1 acceptance: all stage commands present as stubs)."""

import pytest

from pipeline.cli import STAGE_COMMANDS, build_parser, main


def test_help_lists_all_stage_commands(capsys):
    with pytest.raises(SystemExit) as exc:
        build_parser().parse_args(["--help"])
    assert exc.value.code == 0
    help_text = capsys.readouterr().out
    for command in [*STAGE_COMMANDS, "ingest", "seed", "status"]:
        assert command in help_text


@pytest.mark.parametrize("command", list(STAGE_COMMANDS))
def test_stage_stubs_exit_with_clear_message(command):
    with pytest.raises(SystemExit) as exc:
        main([command, "--episode", "1"])
    assert command.split()[0] in str(exc.value) or str(exc.value)  # message non-empty
    assert exc.value.code != 0


def test_transcribe_surfaces_audio_blocker(monkeypatch):
    monkeypatch.delenv("AUDIO_ARCHIVE_URI", raising=False)
    with pytest.raises(SystemExit, match="AUDIO_ARCHIVE_URI"):
        main(["transcribe", "--episode", "1"])


def test_batch_budget_refusal(monkeypatch):
    from pipeline.batch import submit
    from pipeline.config import Config

    monkeypatch.delenv("BATCH_BUDGET_USD", raising=False)
    with pytest.raises(SystemExit, match="BATCH_BUDGET_USD"):
        submit.run(Config.from_env(), [1])


def test_range_flag_parses_inclusive():
    from pipeline.cli import _episode_selection

    args = build_parser().parse_args(["extract", "--range", "10-12"])
    assert _episode_selection(args) == [10, 11, 12]


def test_bad_range_rejected():
    args = build_parser().parse_args(["extract", "--range", "12-10"])
    from pipeline.cli import _episode_selection

    with pytest.raises(SystemExit):
        _episode_selection(args)


def test_seed_dry_run_validates_locally(capsys):
    assert main(["seed", "--dry-run"]) == 0
    out = capsys.readouterr().out
    assert "all seed files valid" in out
