"""empty message

Revision ID: 8562243d20d9
Revises: 9eef7d89f749
Create Date: 2025-05-10 15:37:07.481538

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8562243d20d9'
down_revision = '9eef7d89f749'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('thought', schema=None) as batch_op:
        batch_op.add_column(sa.Column('local_position', sa.JSON(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('thought', schema=None) as batch_op:
        batch_op.drop_column('local_position')

    # ### end Alembic commands ###
