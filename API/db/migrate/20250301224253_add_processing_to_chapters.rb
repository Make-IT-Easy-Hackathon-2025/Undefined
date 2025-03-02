class AddProcessingToChapters < ActiveRecord::Migration[8.0]
  def change
    add_column :chapters, :processing, :boolean, default: false
  end
end
