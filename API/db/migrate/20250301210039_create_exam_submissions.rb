class CreateExamSubmissions < ActiveRecord::Migration[8.0]
  def change
    create_table :exam_submissions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :exam, null: false, foreign_key: { to_table: :chapters } # Exam chapter ID
      t.references :document, null: false, foreign_key: true # A vizsga melyik dokumentumhoz tartozik
      t.jsonb :answers, null: false, default: [] # A válaszokat JSON-ben tároljuk
      t.boolean :graded, default: false # Meg lett-e már értékelve?
      t.integer :score, default: nil # Elért pontszám (opcionális)

      t.timestamps
    end
  end
end
