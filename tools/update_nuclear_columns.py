import csv
from pathlib import Path


def main() -> None:
    """
    For countries that have 0 nuclear in all years, replace
    their `nuclear_electricity` and `nuclear_share_elec` values
    of 0 with empty strings.
    """

    path = Path(
        r"c:\Users\oussema\Documents\GitHub\Policy-Desk\Data\electricity-data.csv"
    )

    rows: list[dict[str, str]] = []
    country_has_nuclear: dict[str | None, bool] = {}

    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if fieldnames is None:
            raise SystemExit("No header found in CSV")

        for row in reader:
            rows.append(row)
            country = row.get("country")
            ne = row.get("nuclear_electricity", "")

            try:
                val = float(ne) if ne not in (None, "") else 0.0
            except ValueError:
                # Non-numeric means treat as non-nuclear (e.g., already N/A)
                val = 0.0

            if country not in country_has_nuclear:
                country_has_nuclear[country] = False
            if val != 0.0:
                country_has_nuclear[country] = True

    # Countries that never have non-zero nuclear_electricity
    countries_without_nuclear = {
        c for c, has in country_has_nuclear.items() if not has and c is not None
    }

    nuc_cols = ["nuclear_electricity", "nuclear_share_elec"]

    for row in rows:
        if row.get("country") in countries_without_nuclear:
            for col in nuc_cols:
                v = row.get(col, "")
                if v in ("", None):
                    continue
                try:
                    val = float(v)
                except ValueError:
                    continue
                if val == 0.0:
                    row[col] = ""  # make empty for countries with no nuclear

    # Write back to the same file
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(
        f"Updated nuclear columns for {len(countries_without_nuclear)} "
        f"countries that have no nuclear in any year."
    )


if __name__ == "__main__":
    main()

