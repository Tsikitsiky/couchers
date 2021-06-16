"""Adding is_deleted and Userblocks

Revision ID: 87cfd4c70e1e
Revises: 2c6aaada8bff
Create Date: 2021-04-16 03:49:52.816897

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "87cfd4c70e1e"
down_revision = "2c6aaada8bff"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "user_blocks",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("blocking_user_id", sa.BigInteger(), nullable=False),
        sa.Column("blocked_user_id", sa.BigInteger(), nullable=False),
        sa.Column("time_blocked", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["blocked_user_id"], ["users.id"], name=op.f("fk_user_blocks_blocked_user_id_users")),
        sa.ForeignKeyConstraint(["blocking_user_id"], ["users.id"], name=op.f("fk_user_blocks_blocking_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_blocks")),
        sa.UniqueConstraint("blocking_user_id", "blocked_user_id", name=op.f("uq_user_blocks_blocking_user_id")),
    )
    op.add_column("users", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"))
    op.execute("ALTER TABLE users ALTER COLUMN is_banned SET DEFAULT false")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("users", "is_deleted")
    op.drop_table("user_blocks")
    # ### end Alembic commands ###
