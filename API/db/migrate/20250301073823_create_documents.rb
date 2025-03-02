class CreateDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :documents do |t|
      t.references :post, null: false, foreign_key: true
      t.string :filename

      t.timestamps
    end
  end
end
