class ChapterSplitter
    # Egyszerű megoldás, amely szó alapú darabolást végez.
    # Alapértelmezetten 1000 szó/chapter, de paraméterezhető.
    def self.split(text, words_per_chapter = 1000)
      words = text.split
      chapters = []
      words.each_slice(words_per_chapter) do |chapter_words|
        chapters << chapter_words.join(" ")
      end
      chapters
    end
  end
  