class AddNeedProcessingToChapters < ActiveRecord::Migration[8.0]
  def change
    add_column :chapters, :need_processing, :boolean
  end
end
