import { getDb } from './db';

const COLORS = [
  '#1a237e', '#0d47a1', '#01579b', '#006064', '#1b5e20',
  '#33691e', '#f57f17', '#e65100', '#bf360c', '#4a148c',
  '#880e4f', '#311b92', '#004d40', '#263238', '#3e2723'
];

const STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana',
  'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Kerala',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar', 'Andhra Pradesh'
];

const AFFILIATIONS = [
  'UGC', 'AICTE', 'Autonomous', 'Deemed University', 'State University', 'Central University'
];

const ACCREDITATIONS = ['NAAC A++', 'NAAC A+', 'NAAC A', 'NAAC B+', 'NBA', 'ABET', 'None'];

const TOP_RECRUITERS: Record<string, string[]> = {
  tech: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Accenture', 'Goldman Sachs', 'JP Morgan'],
  mgmt: ['McKinsey', 'BCG', 'Deloitte', 'KPMG', 'EY', 'Bain & Co', 'PwC', 'Amazon', 'HUL', 'ITC'],
  medical: ['Apollo', 'Fortis', 'AIIMS', 'Manipal Health', 'Max Healthcare', 'Narayana Health'],
};

const colleges = [
  // IITs
  { name: 'Indian Institute of Technology Bombay', location: 'Mumbai', state: 'Maharashtra', type: 'IIT', rating: 4.9, total_fee: 800000, established: 1958, affiliation: 'Autonomous', overview: 'IIT Bombay is one of the premier engineering institutions in India, known for world-class research and industry collaborations. Located in the heart of Mumbai, it consistently ranks among the top institutes globally.', accreditation: 'NAAC A++', nirf_rank: 3, color: '#1a237e', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Delhi', location: 'New Delhi', state: 'Delhi', type: 'IIT', rating: 4.9, total_fee: 820000, established: 1961, affiliation: 'Autonomous', overview: 'IIT Delhi is a premier technical university situated in the capital city. It is renowned for cutting-edge research, exceptional placements, and a vibrant alumni network across the globe.', accreditation: 'NAAC A++', nirf_rank: 2, color: '#0d47a1', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Madras', location: 'Chennai', state: 'Tamil Nadu', type: 'IIT', rating: 4.9, total_fee: 780000, established: 1959, affiliation: 'Autonomous', overview: 'IIT Madras has been ranked as the top engineering institution in India for several consecutive years. Its research parks and startup ecosystem make it a hub of innovation.', accreditation: 'NAAC A++', nirf_rank: 1, color: '#006064', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Kanpur', location: 'Kanpur', state: 'Uttar Pradesh', type: 'IIT', rating: 4.8, total_fee: 790000, established: 1959, affiliation: 'Autonomous', overview: 'IIT Kanpur is known for its academic rigor and pioneering research. It was the first institution in India to offer a computer science program and has produced some of the brightest minds globally.', accreditation: 'NAAC A++', nirf_rank: 4, color: '#4a148c', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Kharagpur', location: 'Kharagpur', state: 'West Bengal', type: 'IIT', rating: 4.8, total_fee: 760000, established: 1951, affiliation: 'Autonomous', overview: 'The oldest and largest IIT, IIT Kharagpur is known for its sprawling campus and multidisciplinary research. It has a strong alumni network and excellent industry ties.', accreditation: 'NAAC A++', nirf_rank: 5, color: '#1b5e20', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Roorkee', location: 'Roorkee', state: 'Uttarakhand', type: 'IIT', rating: 4.7, total_fee: 750000, established: 1847, affiliation: 'Autonomous', overview: 'One of the oldest technical universities in Asia, IIT Roorkee has a rich heritage and excellent academic programs across engineering and sciences.', accreditation: 'NAAC A++', nirf_rank: 6, color: '#33691e', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Hyderabad', location: 'Hyderabad', state: 'Telangana', type: 'IIT', rating: 4.6, total_fee: 720000, established: 2008, affiliation: 'Autonomous', overview: 'A newer IIT with rapidly growing research output and industry partnerships. IIT Hyderabad is known for its innovation-driven culture and strong tech placements.', accreditation: 'NAAC A+', nirf_rank: 8, color: '#e65100', recruiterType: 'tech' },

  // NITs
  { name: 'National Institute of Technology Trichy', location: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'NIT', rating: 4.6, total_fee: 550000, established: 1964, affiliation: 'Autonomous', overview: 'NIT Trichy is consistently ranked as the best NIT in India. It offers top-class engineering programs and has an exceptional placement record with leading global companies.', accreditation: 'NAAC A++', nirf_rank: 9, color: '#880e4f', recruiterType: 'tech' },
  { name: 'National Institute of Technology Surathkal', location: 'Mangalore', state: 'Karnataka', type: 'NIT', rating: 4.5, total_fee: 520000, established: 1960, affiliation: 'Autonomous', overview: 'NIT Surathkal is a premier engineering institution located on the picturesque Konkan coast. It is known for strong academics and excellent placement opportunities.', accreditation: 'NAAC A+', nirf_rank: 12, color: '#01579b', recruiterType: 'tech' },
  { name: 'National Institute of Technology Warangal', location: 'Warangal', state: 'Telangana', type: 'NIT', rating: 4.5, total_fee: 510000, established: 1959, affiliation: 'Autonomous', overview: 'NIT Warangal is one of the oldest and most reputed NITs. Its strong alumni base and research programs make it a top choice for engineering aspirants.', accreditation: 'NAAC A+', nirf_rank: 14, color: '#004d40', recruiterType: 'tech' },
  { name: 'National Institute of Technology Calicut', location: 'Calicut', state: 'Kerala', type: 'NIT', rating: 4.4, total_fee: 490000, established: 1961, affiliation: 'Autonomous', overview: 'Situated in the lush greenery of Kerala, NIT Calicut offers exceptional engineering education with a focus on research and innovation.', accreditation: 'NAAC A+', nirf_rank: 16, color: '#311b92', recruiterType: 'tech' },
  { name: 'National Institute of Technology Rourkela', location: 'Rourkela', state: 'Odisha', type: 'NIT', rating: 4.4, total_fee: 500000, established: 1961, affiliation: 'Autonomous', overview: 'NIT Rourkela has a strong focus on technology and research. It is known for its entrepreneurship cell and active student bodies.', accreditation: 'NAAC A+', nirf_rank: 18, color: '#3e2723', recruiterType: 'tech' },
  { name: 'National Institute of Technology Jaipur', location: 'Jaipur', state: 'Rajasthan', type: 'NIT', rating: 4.3, total_fee: 480000, established: 1963, affiliation: 'Autonomous', overview: 'MNIT Jaipur offers a vibrant academic environment with excellent industry connections. Located in the Pink City, it attracts students from across India.', accreditation: 'NAAC A', nirf_rank: 22, color: '#f57f17', recruiterType: 'tech' },

  // IIITs
  { name: 'IIIT Hyderabad', location: 'Hyderabad', state: 'Telangana', type: 'IIIT', rating: 4.7, total_fee: 900000, established: 1998, affiliation: 'Autonomous', overview: 'IIIT Hyderabad is a premier research university specializing in computing and allied disciplines. It offers innovative dual-degree programs and has a strong startup ecosystem.', accreditation: 'NAAC A+', nirf_rank: 15, color: '#006064', recruiterType: 'tech' },
  { name: 'IIIT Bangalore', location: 'Bangalore', state: 'Karnataka', type: 'IIIT', rating: 4.5, total_fee: 850000, established: 1999, affiliation: 'Autonomous', overview: 'IIIT Bangalore focuses on research and professional programs in computing and management. Located in the Silicon Valley of India, it offers excellent industry exposure.', accreditation: 'NAAC A+', nirf_rank: 20, color: '#1a237e', recruiterType: 'tech' },
  { name: 'IIIT Allahabad', location: 'Prayagraj', state: 'Uttar Pradesh', type: 'IIIT', rating: 4.3, total_fee: 620000, established: 1999, affiliation: 'Autonomous', overview: 'IIIT Allahabad is one of the oldest IIITs in India. It focuses on IT and management education with strong placement support.', accreditation: 'NAAC A', nirf_rank: 28, color: '#4a148c', recruiterType: 'tech' },

  // Top Private/Deemed
  { name: 'Vellore Institute of Technology', location: 'Vellore', state: 'Tamil Nadu', type: 'Deemed', rating: 4.3, total_fee: 750000, established: 1984, affiliation: 'Deemed University', overview: 'VIT is one of the largest private universities in India. Known for its international collaborations, diverse student community, and strong placement record across sectors.', accreditation: 'NAAC A++', nirf_rank: 11, color: '#880e4f', recruiterType: 'tech' },
  { name: 'Manipal Institute of Technology', location: 'Manipal', state: 'Karnataka', type: 'Deemed', rating: 4.2, total_fee: 950000, established: 1957, affiliation: 'Deemed University', overview: 'MIT Manipal is a leading private engineering college known for its infrastructure, international exposure, and strong alumni network across 100+ countries.', accreditation: 'NAAC A+', nirf_rank: 19, color: '#01579b', recruiterType: 'tech' },
  { name: 'SRM Institute of Science and Technology', location: 'Chennai', state: 'Tamil Nadu', type: 'Deemed', rating: 4.1, total_fee: 820000, established: 1985, affiliation: 'Deemed University', overview: 'SRM is a top private university with a massive campus and extensive research facilities. It is known for its diverse engineering and science programs.', accreditation: 'NAAC A++', nirf_rank: 23, color: '#1b5e20', recruiterType: 'tech' },
  { name: 'Birla Institute of Technology and Science Pilani', location: 'Pilani', state: 'Rajasthan', type: 'Deemed', rating: 4.7, total_fee: 1200000, established: 1964, affiliation: 'Deemed University', overview: 'BITS Pilani is a premier private engineering institution with a unique course structure and practice school program. Its alumni are leaders across global technology companies.', accreditation: 'NAAC A', nirf_rank: 7, color: '#33691e', recruiterType: 'tech' },
  { name: 'PSG College of Technology', location: 'Coimbatore', state: 'Tamil Nadu', type: 'Private', rating: 4.1, total_fee: 380000, established: 1951, affiliation: 'Anna University', overview: 'PSG Tech is one of the premier autonomous engineering institutions in South India, known for excellent academics and strong industry linkages.', accreditation: 'NAAC A+', nirf_rank: 35, color: '#e65100', recruiterType: 'tech' },
  { name: 'Amrita School of Engineering', location: 'Coimbatore', state: 'Tamil Nadu', type: 'Deemed', rating: 4.0, total_fee: 700000, established: 1994, affiliation: 'Deemed University', overview: 'Amrita offers quality engineering education with a focus on research and spirituality-infused learning. It has multiple campuses across India.', accreditation: 'NAAC A++', nirf_rank: 24, color: '#263238', recruiterType: 'tech' },
  { name: 'Thapar Institute of Engineering and Technology', location: 'Patiala', state: 'Punjab', type: 'Deemed', rating: 4.2, total_fee: 1100000, established: 1956, affiliation: 'Deemed University', overview: 'Thapar is a highly reputed private engineering university known for its tech-driven curriculum and excellent industry linkages in Punjab and Delhi NCR.', accreditation: 'NAAC A', nirf_rank: 25, color: '#f57f17', recruiterType: 'tech' },
  { name: 'Delhi Technological University', location: 'New Delhi', state: 'Delhi', type: 'Government', rating: 4.2, total_fee: 280000, established: 1941, affiliation: 'Autonomous', overview: 'DTU is one of the oldest and most prestigious engineering institutions in Delhi. It offers a wide range of programs and has excellent placements in both tech and management sectors.', accreditation: 'NAAC A', nirf_rank: 30, color: '#0d47a1', recruiterType: 'tech' },
  { name: 'Netaji Subhas University of Technology', location: 'New Delhi', state: 'Delhi', type: 'Government', rating: 4.0, total_fee: 250000, established: 1983, affiliation: 'Autonomous', overview: 'NSUT is a government-funded technical university in Delhi known for affordable education and strong alumni presence in top tech companies.', accreditation: 'NAAC B+', nirf_rank: 45, color: '#004d40', recruiterType: 'tech' },
  { name: 'PES University', location: 'Bangalore', state: 'Karnataka', type: 'Deemed', rating: 4.2, total_fee: 1000000, established: 1988, affiliation: 'Deemed University', overview: 'PES University is a leading private university in Bangalore with a strong emphasis on innovation and research. Its proximity to IT companies ensures excellent placement outcomes.', accreditation: 'NAAC A', nirf_rank: 40, color: '#1a237e', recruiterType: 'tech' },
  { name: 'RV College of Engineering', location: 'Bangalore', state: 'Karnataka', type: 'Private', rating: 4.1, total_fee: 460000, established: 1963, affiliation: 'VTU', overview: 'RVCE is one of the most sought-after private engineering colleges in Karnataka. Located in the IT hub of Bangalore, it provides excellent exposure and placement opportunities.', accreditation: 'NAAC A+', nirf_rank: 38, color: '#311b92', recruiterType: 'tech' },
  { name: 'MS Ramaiah Institute of Technology', location: 'Bangalore', state: 'Karnataka', type: 'Private', rating: 4.0, total_fee: 500000, established: 1962, affiliation: 'VTU', overview: 'MSRIT is a reputed engineering college in Bangalore with strong research facilities and placement support. It is affiliated to Visvesvaraya Technological University.', accreditation: 'NAAC A+', nirf_rank: 42, color: '#3e2723', recruiterType: 'tech' },
  { name: 'Jadavpur University', location: 'Kolkata', state: 'West Bengal', type: 'Government', rating: 4.4, total_fee: 120000, established: 1955, affiliation: 'Autonomous', overview: 'Jadavpur University is a premier state university known for excellence in arts, science, and engineering. It is celebrated for its vibrant campus culture and academic freedom.', accreditation: 'NAAC A', nirf_rank: 17, color: '#880e4f', recruiterType: 'tech' },
  { name: 'College of Engineering Pune', location: 'Pune', state: 'Maharashtra', type: 'Government', rating: 4.1, total_fee: 150000, established: 1854, affiliation: 'Autonomous', overview: 'COEP is one of the oldest engineering institutions in Asia. Located in the cultural capital of Maharashtra, it offers affordable quality education with excellent industry exposure.', accreditation: 'NAAC A', nirf_rank: 46, color: '#01579b', recruiterType: 'tech' },
  { name: 'Pune Institute of Computer Technology', location: 'Pune', state: 'Maharashtra', type: 'Private', rating: 4.0, total_fee: 420000, established: 1983, affiliation: 'Savitribai Phule Pune University', overview: 'PICT is a top private engineering college in Pune with a strong focus on Computer and IT engineering. It has excellent placements in tech companies across India and abroad.', accreditation: 'NAAC A', nirf_rank: 52, color: '#006064', recruiterType: 'tech' },

  // More diverse colleges
  { name: 'Anna University', location: 'Chennai', state: 'Tamil Nadu', type: 'Government', rating: 4.0, total_fee: 80000, established: 1978, affiliation: 'Autonomous', overview: 'Anna University is a major technical university in Tamil Nadu offering quality education at affordable fees. Its vast network of affiliated colleges makes it one of the largest universities in India.', accreditation: 'NAAC A+', nirf_rank: 48, color: '#4a148c', recruiterType: 'tech' },
  { name: 'Osmania University', location: 'Hyderabad', state: 'Telangana', type: 'Government', rating: 3.8, total_fee: 90000, established: 1918, affiliation: 'State University', overview: 'Osmania University is one of the oldest universities in India, offering programs across arts, science, commerce, and engineering. It has a rich heritage and diverse student community.', accreditation: 'NAAC A', nirf_rank: 65, color: '#1b5e20', recruiterType: 'mgmt' },
  { name: 'Symbiosis Institute of Technology', location: 'Pune', state: 'Maharashtra', type: 'Deemed', rating: 4.0, total_fee: 850000, established: 2008, affiliation: 'Symbiosis International University', overview: 'SIT Pune is a modern engineering institution with a strong industry-connected curriculum. It focuses on holistic development and practical learning.', accreditation: 'NAAC A', nirf_rank: 55, color: '#33691e', recruiterType: 'tech' },
  { name: 'Kalinga Institute of Industrial Technology', location: 'Bhubaneswar', state: 'Odisha', type: 'Deemed', rating: 3.9, total_fee: 680000, established: 1992, affiliation: 'Deemed University', overview: 'KIIT is a rapidly growing deemed university with a beautiful campus and diverse programs. It is known for its tribal student welfare initiatives and research initiatives.', accreditation: 'NAAC A+', nirf_rank: 50, color: '#e65100', recruiterType: 'tech' },
  { name: 'Chandigarh University', location: 'Chandigarh', state: 'Punjab', type: 'Deemed', rating: 4.0, total_fee: 720000, established: 2012, affiliation: 'Deemed University', overview: 'Chandigarh University is one of the fastest-growing private universities in India. It offers a wide range of programs with strong industry tie-ups and international collaborations.', accreditation: 'NAAC A+', nirf_rank: 44, color: '#bf360c', recruiterType: 'tech' },
  { name: 'Lovely Professional University', location: 'Phagwara', state: 'Punjab', type: 'Deemed', rating: 3.7, total_fee: 580000, established: 2005, affiliation: 'Deemed University', overview: 'LPU is one of the largest private universities in India with a massive campus and diverse programs. It attracts students from across India and abroad with its vibrant community.', accreditation: 'NAAC A+', nirf_rank: 62, color: '#263238', recruiterType: 'tech' },
  { name: 'Shiv Nadar University', location: 'Greater Noida', state: 'Uttar Pradesh', type: 'Deemed', rating: 4.1, total_fee: 1100000, established: 2011, affiliation: 'Deemed University', overview: 'Shiv Nadar University is a research-intensive private university with an interdisciplinary approach to education. It offers excellent faculty and modern infrastructure.', accreditation: 'NAAC A', nirf_rank: 36, color: '#3e2723', recruiterType: 'tech' },
  { name: 'Ashoka University', location: 'Sonipat', state: 'Haryana', type: 'Deemed', rating: 4.3, total_fee: 1500000, established: 2014, affiliation: 'Deemed University', overview: 'Ashoka University is a liberal arts institution that offers a multidisciplinary undergraduate education. It is modeled on the best global liberal arts universities and attracts faculty from top global institutions.', accreditation: 'NAAC A', nirf_rank: 41, color: '#f57f17', recruiterType: 'mgmt' },
  { name: 'OP Jindal Global University', location: 'Sonipat', state: 'Haryana', type: 'Deemed', rating: 4.2, total_fee: 1400000, established: 2009, affiliation: 'Deemed University', overview: 'JGU is a leading global university offering programs in law, business, international affairs, and liberal arts. It has strong international collaborations and faculty from around the world.', accreditation: 'NAAC A', nirf_rank: 39, color: '#880e4f', recruiterType: 'mgmt' },

  // Affordable government colleges
  { name: 'Government College of Engineering Pune', location: 'Pune', state: 'Maharashtra', type: 'Government', rating: 3.8, total_fee: 85000, established: 1960, affiliation: 'Autonomous', overview: 'GCEP offers affordable quality engineering education in Pune. It is affiliated to the government and has produced many engineers who are leaders in their fields.', accreditation: 'NAAC B+', nirf_rank: 70, color: '#01579b', recruiterType: 'tech' },
  { name: 'Visvesvaraya National Institute of Technology', location: 'Nagpur', state: 'Maharashtra', type: 'NIT', rating: 4.2, total_fee: 500000, established: 1960, affiliation: 'Autonomous', overview: 'VNIT Nagpur is one of the top NITs in India offering quality technical education. It has a strong research culture and excellent industry connections.', accreditation: 'NAAC A+', nirf_rank: 27, color: '#4a148c', recruiterType: 'tech' },

  // IIMs (Management)
  { name: 'Indian Institute of Management Ahmedabad', location: 'Ahmedabad', state: 'Gujarat', type: 'IIT', rating: 5.0, total_fee: 2400000, established: 1961, affiliation: 'Autonomous', overview: 'IIM Ahmedabad is the top management school in India and ranks among the best globally. Its flagship PGP program is the most sought-after MBA in the country with unmatched placement outcomes.', accreditation: 'AACSB', nirf_rank: 1, color: '#1a237e', recruiterType: 'mgmt' },
  { name: 'Indian Institute of Management Bangalore', location: 'Bangalore', state: 'Karnataka', type: 'IIT', rating: 4.9, total_fee: 2300000, established: 1973, affiliation: 'Autonomous', overview: 'IIM Bangalore is renowned for excellence in management education, research, and entrepreneurship. Its EPGP and PGP programs are world-class with outstanding alumni in global leadership roles.', accreditation: 'AACSB', nirf_rank: 2, color: '#0d47a1', recruiterType: 'mgmt' },
  { name: 'Indian Institute of Management Calcutta', location: 'Kolkata', state: 'West Bengal', type: 'IIT', rating: 4.9, total_fee: 2200000, established: 1961, affiliation: 'Autonomous', overview: 'IIM Calcutta is the oldest IIM and continues to be among the elite management institutions. It has a strong focus on finance and analytics with exceptional industry partnerships.', accreditation: 'AACSB', nirf_rank: 3, color: '#006064', recruiterType: 'mgmt' },
  { name: 'XLRI School of Business and Human Resources', location: 'Jamshedpur', state: 'Jharkhand', type: 'Deemed', rating: 4.6, total_fee: 2100000, established: 1949, affiliation: 'Autonomous', overview: 'XLRI Jamshedpur is one of the oldest and most respected business schools in India, specializing in HRM and business management. Its BM and HRM programs are highly coveted.', accreditation: 'AACSB', nirf_rank: 5, color: '#1b5e20', recruiterType: 'mgmt' },

  // More tech colleges to reach 50+
  { name: 'Indian Institute of Technology Gandhinagar', location: 'Gandhinagar', state: 'Gujarat', type: 'IIT', rating: 4.5, total_fee: 700000, established: 2008, affiliation: 'Autonomous', overview: 'IIT Gandhinagar is known for its liberal education approach and interdisciplinary research. It combines strong engineering fundamentals with humanities and social sciences.', accreditation: 'NAAC A+', nirf_rank: 11, color: '#e65100', recruiterType: 'tech' },
  { name: 'Indian Institute of Technology Patna', location: 'Patna', state: 'Bihar', type: 'IIT', rating: 4.2, total_fee: 680000, established: 2008, affiliation: 'Autonomous', overview: 'IIT Patna is rapidly growing in research and academic quality. It offers excellent engineering programs and is developing strong industry partnerships.', accreditation: 'NAAC A', nirf_rank: 32, color: '#311b92', recruiterType: 'tech' },
  { name: 'NIT Silchar', location: 'Silchar', state: 'Assam', type: 'NIT', rating: 3.9, total_fee: 470000, established: 1967, affiliation: 'Autonomous', overview: 'NIT Silchar is one of the leading NITs in Northeast India. It offers comprehensive engineering and science programs with improving industry connections.', accreditation: 'NAAC A', nirf_rank: 43, color: '#880e4f', recruiterType: 'tech' },
  { name: 'Ramaiah University of Applied Sciences', location: 'Bangalore', state: 'Karnataka', type: 'Deemed', rating: 3.9, total_fee: 600000, established: 2013, affiliation: 'Deemed University', overview: 'RUAS is a multidisciplinary university offering programs in engineering, health sciences, and design. It leverages the Ramaiah Group legacy for industry connections.', accreditation: 'NAAC B+', nirf_rank: 68, color: '#01579b', recruiterType: 'tech' },
  { name: 'Graphic Era University', location: 'Dehradun', state: 'Uttarakhand', type: 'Deemed', rating: 3.7, total_fee: 500000, established: 1993, affiliation: 'Deemed University', overview: 'Graphic Era is a popular deemed university in the hills of Uttarakhand. It offers diverse programs with a scenic campus environment and improving placement outcomes.', accreditation: 'NAAC A', nirf_rank: 72, color: '#006064', recruiterType: 'tech' },
  { name: 'Karunya Institute of Technology and Sciences', location: 'Coimbatore', state: 'Tamil Nadu', type: 'Deemed', rating: 3.8, total_fee: 550000, established: 1986, affiliation: 'Deemed University', overview: 'Karunya is a Christian minority deemed university offering value-based technical education. It has a strong emphasis on character development alongside academics.', accreditation: 'NAAC A', nirf_rank: 60, color: '#4a148c', recruiterType: 'tech' },
  { name: 'Kongu Engineering College', location: 'Erode', state: 'Tamil Nadu', type: 'Private', rating: 3.8, total_fee: 300000, established: 1983, affiliation: 'Anna University', overview: 'Kongu Engineering College is a well-established autonomous institution in Tamil Nadu known for quality technical education and strong industry connections in the Erode-Coimbatore region.', accreditation: 'NAAC A+', nirf_rank: 66, color: '#33691e', recruiterType: 'tech' },
  { name: 'Sri Sivasubramaniya Nadar College of Engineering', location: 'Chennai', state: 'Tamil Nadu', type: 'Private', rating: 4.0, total_fee: 350000, established: 1996, affiliation: 'Anna University', overview: 'SSN College of Engineering is one of the top private engineering colleges in Tamil Nadu. It is known for its research culture and strong placement record in core and IT sectors.', accreditation: 'NAAC A+', nirf_rank: 49, color: '#f57f17', recruiterType: 'tech' },
];

const COURSES: Record<string, { name: string; duration: string; baseMultiplier: number }[]> = {
  tech: [
    { name: 'B.Tech Computer Science Engineering', duration: '4 years', baseMultiplier: 1.0 },
    { name: 'B.Tech Electronics & Communication', duration: '4 years', baseMultiplier: 0.95 },
    { name: 'B.Tech Mechanical Engineering', duration: '4 years', baseMultiplier: 0.9 },
    { name: 'B.Tech Civil Engineering', duration: '4 years', baseMultiplier: 0.85 },
    { name: 'B.Tech Electrical Engineering', duration: '4 years', baseMultiplier: 0.9 },
    { name: 'M.Tech Computer Science', duration: '2 years', baseMultiplier: 0.6 },
    { name: 'M.Tech VLSI Design', duration: '2 years', baseMultiplier: 0.55 },
    { name: 'PhD Engineering', duration: '4-6 years', baseMultiplier: 0.2 },
  ],
  mgmt: [
    { name: 'MBA (General Management)', duration: '2 years', baseMultiplier: 1.0 },
    { name: 'MBA (Finance)', duration: '2 years', baseMultiplier: 1.0 },
    { name: 'MBA (Marketing)', duration: '2 years', baseMultiplier: 1.0 },
    { name: 'MBA (Human Resources)', duration: '2 years', baseMultiplier: 0.95 },
    { name: 'Executive MBA', duration: '1 year', baseMultiplier: 0.8 },
    { name: 'PhD Management', duration: '4-5 years', baseMultiplier: 0.2 },
  ],
};

const REVIEW_TEMPLATES = [
  { author: 'Arjun Kumar', comment: 'Excellent faculty and world-class infrastructure. The placement support was phenomenal and helped me land my dream job.', category: 'Placements' },
  { author: 'Priya Sharma', comment: 'Amazing campus life with a great mix of academics and extracurriculars. The hostel facilities are top-notch.', category: 'Campus Life' },
  { author: 'Rahul Verma', comment: 'The curriculum is industry-relevant and regularly updated. Faculty are approachable and highly qualified.', category: 'Academics' },
  { author: 'Sneha Patel', comment: 'Good research opportunities and labs. The library has an excellent collection of resources.', category: 'Infrastructure' },
  { author: 'Vikram Singh', comment: 'Competitive atmosphere but supportive peer group. The alumni network has been invaluable for career growth.', category: 'Overall' },
  { author: 'Ananya Roy', comment: 'The fees are justified given the quality of education and placement outcomes. Scholarships are available for deserving students.', category: 'Value for Money' },
  { author: 'Karthik Rajan', comment: 'Industry exposure through internships and live projects is exceptional. The career cell is very active.', category: 'Placements' },
  { author: 'Meera Nair', comment: 'The college has excellent sports facilities and encourages students to participate in inter-college tournaments.', category: 'Campus Life' },
];

const EXAM_CUTOFFS: { exam: string; baseRank: number; variance: number }[] = [
  { exam: 'JEE Advanced', baseRank: 500, variance: 200 },
  { exam: 'JEE Mains', baseRank: 5000, variance: 3000 },
  { exam: 'BITSAT', baseRank: 300, variance: 100 },
  { exam: 'KCET', baseRank: 1000, variance: 500 },
  { exam: 'MHT CET', baseRank: 2000, variance: 1000 },
  { exam: 'AP EAPCET', baseRank: 1500, variance: 800 },
  { exam: 'TS EAPCET', baseRank: 1500, variance: 800 },
  { exam: 'WBJEE', baseRank: 2000, variance: 1000 },
  { exam: 'CAT', baseRank: 99, variance: 2 },
  { exam: 'GMAT', baseRank: 720, variance: 30 },
];

export function seed() {
  const db = getDb();
  
  // Check if already seeded
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM colleges').get() as { cnt: number }).cnt;
  if (count > 0) return;

  console.log('Seeding database...');

  const insertCollege = db.prepare(`
    INSERT INTO colleges (name, location, state, type, rating, total_fee, established, affiliation, overview, image_color, accreditation, nirf_rank)
    VALUES (@name, @location, @state, @type, @rating, @total_fee, @established, @affiliation, @overview, @image_color, @accreditation, @nirf_rank)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (college_id, name, duration, fee, seats)
    VALUES (@college_id, @name, @duration, @fee, @seats)
  `);

  const insertPlacement = db.prepare(`
    INSERT INTO placements (college_id, avg_package, highest_package, placement_rate, top_recruiters)
    VALUES (@college_id, @avg_package, @highest_package, @placement_rate, @top_recruiters)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (college_id, author, rating, comment, date, category)
    VALUES (@college_id, @author, @rating, @comment, @date, @category)
  `);

  const insertPredictor = db.prepare(`
    INSERT INTO predictor_data (college_id, exam, cutoff_rank, category, branch)
    VALUES (@college_id, @exam, @cutoff_rank, @category, @branch)
  `);

  const seedAll = db.transaction(() => {
    for (const [i, college] of colleges.entries()) {
      const result = insertCollege.run({
        name: college.name,
        location: college.location,
        state: college.state,
        type: college.type,
        rating: college.rating,
        total_fee: college.total_fee,
        established: college.established,
        affiliation: college.affiliation,
        overview: college.overview,
        image_color: college.color,
        accreditation: college.accreditation,
        nirf_rank: college.nirf_rank,
      });
      const id = result.lastInsertRowid as number;

      // Seed FTS
      db.prepare(`INSERT INTO colleges_fts(rowid, name, location, state, affiliation) VALUES (?, ?, ?, ?, ?)`)
        .run(id, college.name, college.location, college.state, college.affiliation);

      // Courses
      const courseList = COURSES[college.recruiterType] ?? COURSES.tech;
      for (const course of courseList) {
        insertCourse.run({
          college_id: id,
          name: course.name,
          duration: course.duration,
          fee: Math.round(college.total_fee * course.baseMultiplier / 1000) * 1000,
          seats: Math.floor(Math.random() * 80) + 40,
        });
      }

      // Placements
      const ratingFactor = college.rating / 5;
      const avgPackage = Math.round((ratingFactor * 1800000 + 400000 + Math.random() * 300000) / 10000) * 10000;
      const highestPackage = Math.round((avgPackage * (2.5 + Math.random() * 2)) / 100000) * 100000;
      const placementRate = Math.min(100, Math.round(ratingFactor * 60 + 30 + Math.random() * 10));
      const recruiters = (TOP_RECRUITERS[college.recruiterType] ?? TOP_RECRUITERS.tech)
        .sort(() => Math.random() - 0.5).slice(0, 6);
      insertPlacement.run({
        college_id: id,
        avg_package: avgPackage,
        highest_package: highestPackage,
        placement_rate: placementRate,
        top_recruiters: JSON.stringify(recruiters),
      });

      // Reviews — pick 3-5 random reviews
      const reviewCount = 3 + Math.floor(Math.random() * 3);
      const shuffled = [...REVIEW_TEMPLATES].sort(() => Math.random() - 0.5);
      for (let r = 0; r < reviewCount; r++) {
        const tmpl = shuffled[r % shuffled.length];
        insertReview.run({
          college_id: id,
          author: tmpl.author,
          rating: Math.min(5, Math.max(3, college.rating + (Math.random() * 0.6 - 0.3))).toFixed(1),
          comment: tmpl.comment,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0],
          category: tmpl.category,
        });
      }

      // Predictor data
      for (const examData of EXAM_CUTOFFS) {
        // Only assign relevant exams
        const isMgmt = college.recruiterType === 'mgmt';
        const isMgmtExam = examData.exam === 'CAT' || examData.exam === 'GMAT';
        if (isMgmt !== isMgmtExam) continue;

        const rankFactor = 6 - college.rating; // lower rating = higher cutoff rank (harder to get in)
        let cutoff = Math.round(examData.baseRank * rankFactor + Math.random() * examData.variance);
        if (examData.exam === 'CAT') cutoff = Math.min(100, Math.max(75, 100 - (rankFactor * 5)));

        const categories = ['General', 'OBC', 'SC', 'ST'];
        for (const cat of categories) {
          const catMultiplier = cat === 'General' ? 1 : cat === 'OBC' ? 1.3 : cat === 'SC' ? 2.0 : 3.0;
          const branches = college.recruiterType === 'tech' ? ['CSE', 'ECE', 'ME', 'EE'] : ['MBA'];
          for (const branch of branches) {
            const branchMultiplier = branch === 'CSE' ? 1 : branch === 'ECE' ? 1.2 : 1.5;
            insertPredictor.run({
              college_id: id,
              exam: examData.exam,
              cutoff_rank: Math.round(cutoff * catMultiplier * branchMultiplier),
              category: cat,
              branch,
            });
          }
        }
      }
    }
  });

  seedAll();
  console.log(`Seeded ${colleges.length} colleges successfully.`);
}
