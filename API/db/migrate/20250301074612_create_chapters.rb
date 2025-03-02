class CreateChapters < ActiveRecord::Migration[8.0]
  def change
    create_table :chapters do |t|
      t.references :document, null: false, foreign_key: true
      t.text :original_content
      t.string :title
      t.text :ai_summary
      t.json :generated_questions

      t.timestamps
    end
  end
end
