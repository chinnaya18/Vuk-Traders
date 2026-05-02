"""Add round_off column to invoices

Revision ID: e3f1a2b4c5d6
Revises: cccc26c281b1
Create Date: 2026-05-02 11:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3f1a2b4c5d6'
down_revision: Union[str, None] = 'd11f291c9951'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('round_off', sa.Numeric(precision=12, scale=2), server_default='0', nullable=True))


def downgrade() -> None:
    op.drop_column('invoices', 'round_off')
