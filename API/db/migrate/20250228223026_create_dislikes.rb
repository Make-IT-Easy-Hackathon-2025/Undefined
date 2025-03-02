class CreateDislikes < ActiveRecord::Migration[8.0]
  def change
    create_table :dislikes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :post, null: false, foreign_key: true

      t.timestamps
    end
  end
end
