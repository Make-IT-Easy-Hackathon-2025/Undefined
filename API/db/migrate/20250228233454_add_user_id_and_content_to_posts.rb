class AddUserIdAndContentToPosts < ActiveRecord::Migration[8.0]
  def change
    add_reference :posts, :user, null: false, foreign_key: true
    add_column :posts, :content, :string
  end
end
