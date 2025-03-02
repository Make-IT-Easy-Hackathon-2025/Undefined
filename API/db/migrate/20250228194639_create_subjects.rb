class CreateSubjects < ActiveRecord::Migration[8.0]
  def change
    create_table :subjects do |t|
      t.string :title
      t.integer :year

      t.timestamps
    end
  end
end
