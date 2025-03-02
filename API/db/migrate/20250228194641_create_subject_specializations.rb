class CreateSubjectSpecializations < ActiveRecord::Migration[8.0]
  def change
    create_table :subject_specializations do |t|
      t.references :subject, null: false, foreign_key: true
      t.references :specialization, null: false, foreign_key: true

      t.timestamps
    end
  end
end
