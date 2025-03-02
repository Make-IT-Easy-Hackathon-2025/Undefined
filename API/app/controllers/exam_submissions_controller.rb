class ExamSubmissionsController < ApplicationController
  def create
    user = Current.session.user
    exam = Chapter.find_by(id: submission_params[:exam_id], chapter_type: 'exam')
    return render json: { error: 'Vizsga (exam) nem található' }, status: :not_found unless exam
  
    # Ellenőrizzük, hogy létezik-e már submission az adott felhasználóhoz a megadott vizsgához és dokumentumhoz
    submission = ExamSubmission.find_by(user: user, exam_id: exam.id, document_id: exam.document_id)
  
    if submission
      # Ha létezik, akkor frissítjük a meglévő submission attribútumait
      submission.assign_attributes(submission_params)
    else
      # Ha nem létezik, akkor új submission-t hozunk létre
      submission = ExamSubmission.new(submission_params)
      submission.user = user
      submission.document = exam.document
    end
  
    if submission.save
      unless exam.generated_questions.present? && exam.generated_questions['questions'].present?
        return render json: { error: 'Vizsga kérdések nem elérhetők a kiértékeléshez.' }, status: :unprocessable_entity
      end
  
      score = grade_submission(submission, exam)
      submission.update(graded: true, score: score)
  
      # Ha update-eltük, akkor status :ok, ha újonnan hoztuk létre, akkor :created
      status_code = submission.previous_changes.include?("id") ? :created : :ok
      render json: { message: 'Submission created/updated and graded', submission: submission_json(submission) },
             status: status_code
    else
      render json: { error: submission.errors.full_messages }, status: :unprocessable_entity
    end
  rescue StandardError => e
    Rails.logger.error "Error creating/grading submission: #{e.message}"
    render json: { error: 'Failed to create and grade submission' }, status: :internal_server_error
  end
  

  def show
    user = Current.session.user
    document_id = params[:document_id]
    chapter_id = params[:chapter_id]
  
    Rails.logger.debug "DEBUG: Current user: #{user.inspect}"
    Rails.logger.debug "DEBUG: Requested document ID: #{document_id.inspect}, chapter ID: #{chapter_id.inspect}"
  
    submission = ExamSubmission.joins("INNER JOIN chapters ON chapters.id = exam_submissions.exam_id")
                               .where(user: user)
                               .where("exam_submissions.document_id = ? AND chapters.id = ?", document_id, chapter_id)
                               .first
  
    if submission
      Rails.logger.debug "DEBUG: Found submission: #{submission.inspect}"
      render json: submission_json(submission), status: :ok
    else
      Rails.logger.debug "DEBUG: Submission not found for user #{user.id} with Document ID #{document_id.inspect} and Chapter ID #{chapter_id.inspect}"
      render json: { error: 'Submission not found' }, status: :not_found
    end
  end
  
  

  private

  require 'json'

  def grade_submission(submission, exam)
    questions = exam.generated_questions['questions']

    Rails.logger.debug "DEBUG: Exam questions:\n#{JSON.pretty_generate(questions)}"
    Rails.logger.debug "DEBUG: Submission answers:\n#{JSON.pretty_generate(submission.answers)}"

    score = 0

    questions.each_with_index do |q, idx|
      question_number = idx + 1
      user_answer_data = submission.answers.find { |a| a['question_number'].to_i == question_number }

      Rails.logger.debug "DEBUG: For question #{question_number}, user answer:\n#{JSON.pretty_generate(user_answer_data)}"

      next unless user_answer_data

      correct_option_index = q['options'].find_index { |option| option['isCorrect'] }
      correct_answer = correct_option_index ? (correct_option_index + 1) : nil

      Rails.logger.debug "DEBUG: Question #{question_number} - correct answer: #{correct_answer}"

      score += 1 if correct_answer && user_answer_data['answer'].to_i == correct_answer
    end

    percentage_score = ((score.to_f / (questions.length - 1)) * 100).round(2)

    Rails.logger.debug "DEBUG: Score: #{score}"
    Rails.logger.debug "DEBUG: Total questions: #{questions.length}"

    Rails.logger.debug "DEBUG: Final calculated score: #{percentage_score}%"

    percentage_score
  end

  def submission_params
    params.require(:exam_submission).permit(:exam_id, answers: %i[question_number answer])
  end

  def submission_json(submission)
    exam = submission.exam
    questions = exam.generated_questions['questions']
    answers = submission.answers

    Rails.logger.debug "DEBUG: Exam questions: #{questions.inspect}"
    Rails.logger.debug "DEBUG: Submission answers: #{answers.inspect}"

    {
      id: submission.id,
      exam_id: exam.id,
      score: calculate_score(answers, questions),
      results: questions.each_with_index.map do |q, idx|
        question_number = idx + 1
        user_answer_data = answers.find { |a| a['question_number'].to_i == question_number }

        correct_option_index = q['options'].find_index { |option| option['isCorrect'] }
        correct_answer = correct_option_index ? (correct_option_index + 1) : nil

        Rails.logger.debug "DEBUG: Processing question #{question_number}, correct answer: #{correct_answer}"

        {
          question_number: question_number,
          selected_answer: user_answer_data ? user_answer_data['answer'].to_i : nil,
          correct_answer: correct_answer,
          explanation: q['explanation'],
          is_correct: correct_answer && user_answer_data && (user_answer_data['answer'].to_i == correct_answer)
        }
      end
    }
  end

  def calculate_score(answers, questions)
    correct_count = answers.count do |a|
      question_index = a['question_number'].to_i - 1
      q = questions[question_index]

      if q.nil?
        Rails.logger.error "ERROR: Could not find question at index #{question_index} (question_number: #{a['question_number']})"
        next false
      end

      correct_option_index = q['options'].find_index { |option| option['isCorrect'] }
      correct_answer = correct_option_index ? (correct_option_index + 1) : nil

      correct_answer && a['answer'].to_i == correct_answer
    end

    ((correct_count.to_f / questions.length) * 100).round(2)
  end
end
