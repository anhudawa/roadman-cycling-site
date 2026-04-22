export interface MarqueeGuest {
  name: string;
  credential: string;
  href?: string;
}

/**
 * Shared guest list for the GuestMarquee component. Originally lived
 * inline in src/app/page.tsx — extracted here so /plateau (and any
 * future landing page) can render the same authority signal without
 * duplicating the data.
 */
export const MARQUEE_GUESTS: MarqueeGuest[] = [
  { name: "Greg LeMond", credential: "3× Tour de France winner", href: "https://www.youtube.com/watch?v=_kFSe3VxS10" },
  { name: "Professor Seiler", credential: "Polarised training pioneer", href: "https://www.youtube.com/watch?v=j443DjmheHw" },
  { name: "Dan Lorang", credential: "Red Bull–Bora–Hansgrohe", href: "https://www.youtube.com/watch?v=Qbub4VwLHW4" },
  { name: "Lachlan Morton", credential: "EF Education, alt-racing pioneer", href: "https://www.youtube.com/watch?v=-X-Owk2VOoM" },
  { name: "Dan Bigham", credential: "Former Hour Record holder", href: "https://www.youtube.com/watch?v=gxiqIIVB3OA" },
  { name: "Alistair Brownlee", credential: "2× Olympic triathlon gold", href: "https://www.youtube.com/watch?v=gZEl_NCr5_I" },
  { name: "Valtteri Bottas", credential: "F1 driver & cyclist", href: "https://www.youtube.com/watch?v=F9Fnts3Cv_U" },
  { name: "Alex Dowsett", credential: "Former Hour Record holder, TT specialist", href: "https://www.youtube.com/watch?v=DnGKpEPEdUM" },
  { name: "George Hincapie", credential: "17× Tour de France starter", href: "https://www.youtube.com/watch?v=nEBqxv2WZVs" },
  { name: "André Greipel", credential: "22 Grand Tour stage wins", href: "https://www.youtube.com/watch?v=aLrD94_D13Y" },
  { name: "Joe Friel", credential: "Author, Cyclist's Training Bible", href: "https://www.youtube.com/watch?v=ov9qv73_lH4" },
  { name: "Hannah Grant", credential: "Pro team chef", href: "https://www.youtube.com/watch?v=fAvIMy4UQu4" },
  { name: "Ed Clancy", credential: "3× Olympic gold, team pursuit", href: "https://www.youtube.com/watch?v=NQ2d5IFGmaA" },
  { name: "Tim Spector", credential: "ZOE founder, epidemiologist", href: "https://www.youtube.com/watch?v=GdIJQ__lqHA" },
  { name: "Mark Beaumont", credential: "Around the World record", href: "https://www.youtube.com/watch?v=b27wvtFa78g" },
  { name: "Colin O Brady", credential: "Solo Antarctic crossing, 10 Peaks adventurer", href: "https://www.youtube.com/watch?v=Pu8hNDM9uzU" },
  { name: "Uli Schoberer", credential: "Inventor of the SRM power meter", href: "https://www.youtube.com/watch?v=GPY7ReSpOpU" },
];
