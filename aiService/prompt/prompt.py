from prompt.prompt_template import *
from typing import List, Dict, Any, Optional
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from m_schema.schema_engine import SchemaEngine
from sql.sql_handler import execute_sql
import glob


def get_engine():
    """
    Tạo và trả về một đối tượng SQLAlchemy Engine kết nối đến cơ sở dữ liệu SQLite.
    Nếu không tìm thấy file .db, trả về None.
    """
    db_path = get_db_path()
    if not db_path:
        return None
    return create_engine(f"sqlite:///{db_path}")


def get_db_path() -> Optional[str]:
    """
    Tìm kiếm file .db đầu tiên trong thư mục databases của dự án.
    Trả về đường dẫn tuyệt đối nếu tìm thấy, ngược lại trả về None.
    """
    # Xác định thư mục gốc dự án dựa trên vị trí file hiện tại
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    db_folder = os.path.join(base_dir, "aiService", "databases")
    db_files = glob.glob(os.path.join(db_folder, "*.db"))
    #  print("DEBUG - db_folder:", db_folder)
    #  print("DEBUG - db_files:", db_files)
    return db_files[0] if db_files else None


def get_mschema_str(db_path: Optional[str]) -> str:
    if not db_path:
        return "No database file found."
    engine = create_engine(f"sqlite:///{db_path}")
    mschema = SchemaEngine(engine, db_name=os.path.basename(db_path))
    mschema = mschema.mschema

    mschema_str = mschema.to_mschema()
    return mschema_str if mschema_str else "No schema found."


def get_evidence() -> str:
    db_path = get_db_path()
    if not db_path:
        return "No database file found."
    engine = create_engine(f"sqlite:///{db_path}")

    # Lấy danh sách tên bảng
    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if not tables:
        return "No tables found in database."

    evidence_list = []
    for table in tables:
        sql_code = f"SELECT * FROM {table} LIMIT 3;"
        evidence, _ = execute_sql(engine, sql_code)
        evidence_list.append(
            f"Table: {table}\n{evidence if evidence else 'No data found.'}"
        )

    return "\n\n".join(evidence_list)


def get_dialect(engine):
    return engine.dialect.name if engine else None


def init_prompt():
    db_path = get_db_path()
    return SYSTEM_PROMPT.format(
        db_path if db_path else "No database file found.",
        get_mschema_str(db_path),
        get_evidence(),
    )


print(init_prompt())
