from sqlalchemy import text
from tabulate import tabulate
import re
import pandas as pd


def generate_sql(text: str):
    sql_code_match = re.search(r"```sql(.*?)```", text, re.DOTALL)

    if sql_code_match:
        sql_code = sql_code_match.group(1).strip()
        return sql_code

    return None


def execute_sql(engine, sql_code: str):
    if not engine or not sql_code:
        return None, "Issue with engine or SQL code."

    try:
        queries = [q.strip() for q in sql_code.strip().split(";") if q.strip()]
        all_results = []

        with engine.connect() as conn:
            for q in queries:
                if not q.lower().startswith("select"):
                    return None, "Only SELECT queries are allowed."

                result = conn.execute(text(q))
                rows = result.fetchall()

                if not rows:
                    return None, "No results found for the query."

                else:
                    df = pd.DataFrame(rows, columns=result.keys())
                    formatted_result = tabulate(
                        df,
                        headers="keys",
                        tablefmt="grid",
                        showindex=False,
                        stralign="center",
                        numalign="center",
                    )
                    all_results.append(formatted_result)

        return "\n\n---\n\n".join(all_results), None

    except Exception as e:
        return None, f"Error parsing SQL code: {str(e)}"
