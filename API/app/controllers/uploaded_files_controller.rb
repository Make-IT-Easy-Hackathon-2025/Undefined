class UploadedFilesController < ApplicationController
  def create
    return render json: { error: 'No file uploaded' }, status: :bad_request if params[:file].blank?

    uploaded_file = UploadedFile.new
    uploaded_file.file.attach(params[:file])

    if uploaded_file.file.attached?
      uploaded_file.filename = uploaded_file.file.filename.to_s
      uploaded_file.filetype = uploaded_file.file.content_type
      uploaded_file.save

      render json: {
        message: 'File uploaded successfully',
        file_url: url_for(uploaded_file.file)
      }, status: :created
    else
      render json: { error: 'File upload failed' }, status: :unprocessable_entity
    end
  end
end
