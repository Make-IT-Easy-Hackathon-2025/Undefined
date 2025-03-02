class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.text :description
      t.references :subject, null: false, foreign_key: true  # Kapcsolat a subjects táblával

      t.timestamps
    end
  end
end