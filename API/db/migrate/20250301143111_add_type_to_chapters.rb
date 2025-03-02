class AddTypeToChapters < ActiveRecord::Migration[8.0]
  def change
    add_column :chapters, :chapter_type, :string
  end
end
