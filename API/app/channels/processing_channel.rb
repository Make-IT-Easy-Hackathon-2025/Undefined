class ProcessingChannel < ApplicationCable::Channel
  def subscribed
    stream_from "processing_#{params[:job_id]}_channel"
  end

  def unsubscribed
  end
end
