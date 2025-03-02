# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_03_01_224253) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "chapters", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.text "original_content"
    t.string "title"
    t.text "ai_summary"
    t.json "generated_questions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "chapter_type"
    t.boolean "need_processing"
    t.boolean "processing", default: false
    t.index ["document_id"], name: "index_chapters_on_document_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "dislikes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_dislikes_on_post_id"
    t.index ["user_id"], name: "index_dislikes_on_user_id"
  end

  create_table "documents", force: :cascade do |t|
    t.bigint "post_id", null: false
    t.string "filename"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_documents_on_post_id"
  end

  create_table "exam_submissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "exam_id", null: false
    t.bigint "document_id", null: false
    t.jsonb "answers", default: [], null: false
    t.boolean "graded", default: false
    t.integer "score"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_id"], name: "index_exam_submissions_on_document_id"
    t.index ["exam_id"], name: "index_exam_submissions_on_exam_id"
    t.index ["user_id"], name: "index_exam_submissions_on_user_id"
  end

  create_table "likes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.bigint "subject_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "content"
    t.index ["subject_id"], name: "index_posts_on_subject_id"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "specializations", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "subject_specializations", force: :cascade do |t|
    t.bigint "subject_id", null: false
    t.bigint "specialization_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["specialization_id"], name: "index_subject_specializations_on_specialization_id"
    t.index ["subject_id"], name: "index_subject_specializations_on_subject_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.string "title"
    t.integer "year"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_subjects", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "subject_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subject_id"], name: "index_user_subjects_on_subject_id"
    t.index ["user_id"], name: "index_user_subjects_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user", null: false
    t.string "firstname"
    t.string "lastname"
    t.string "institution"
    t.string "country"
    t.string "educationlevel"
    t.string "usageplan"
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "chapters", "documents"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "dislikes", "posts"
  add_foreign_key "dislikes", "users"
  add_foreign_key "documents", "posts"
  add_foreign_key "exam_submissions", "chapters", column: "exam_id"
  add_foreign_key "exam_submissions", "documents"
  add_foreign_key "exam_submissions", "users"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "posts", "subjects"
  add_foreign_key "posts", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "subject_specializations", "specializations"
  add_foreign_key "subject_specializations", "subjects"
  add_foreign_key "user_subjects", "subjects"
  add_foreign_key "user_subjects", "users"
end
