'use client';
 
export default function TestimonialsSection({ content }: { content: any }) {
  return (
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-black mb-8">{content.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(content.reviews || []).map((r: any) => (
          <div key={`${r.name}-${r.content?.substring(0, 20)}`} className="p-6 bg-white rounded-3xl text-left border-2 border-gray-50 shadow-sm hover:shadow-md transition-shadow italic relative">
            <span className="text-4xl text-primary/20 absolute top-4 left-4 font-serif">"</span>
            <p className="relative z-10 text-gray-700"> {r.content}</p>
            <div className="mt-4 font-black not-italic text-primary">— {r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
